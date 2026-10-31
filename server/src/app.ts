import { company } from "../../shared/company.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { ZodError } from "zod";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { photosDirectory } from "./paths.js";
import mongoose from "mongoose";
import { config } from "./config.js";
import { auth } from "./auth.js";
import { portal } from "./portal.js";
import { admin } from "./admin.js";
import { publicContent, contentAdmin } from "./content.js";
import { Service, Inquiry, User, BusinessSettings } from "./models.js";
import { services, faqs, areas } from "../../shared/catalog.js";
import { inquirySchema } from "../../shared/schemas.js";
import { wrap, ok, HttpError, log, id, notify } from "./lib.js";
export const app = express();
// Render terminates HTTPS at its reverse proxy. Trust that immediate proxy only.
if (config.NODE_ENV === "production") app.set("trust proxy", 1);
app.get("/robots.txt", (_req, res) =>
  res
    .type("text/plain")
    .send(
      `User-agent: *\nAllow: /\nDisallow: /portal\nDisallow: /api/\nSitemap: ${config.CLIENT_URL}/sitemap.xml\n`,
    ),
);
app.get("/sitemap.xml", (_req, res) => {
  const paths = [
    "",
    "/about",
    "/services",
    "/how-it-works",
    "/contact",
    "/faq",
    "/careers",
    ...services.map((s) => `/services/${s.slug}`),
  ];
  const origin = config.CLIENT_URL.replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  res
    .type("application/xml")
    .send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((p) => `<url><loc>${origin}${p}</loc></url>`).join("")}</urlset>`,
    );
});
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "img-src": ["'self'", "data:", "https://images.unsplash.com"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "script-src": ["'self'"],
        "connect-src": ["'self'"],
        "upgrade-insecure-requests":
          config.NODE_ENV === "production" ? [] : null,
      },
    },
  }),
);
// Keep the previously requested all-domain mode, with an optional production allowlist.
// Cookies require an exact reflected origin rather than an ACAO wildcard.
const allOrigins = config.CORS_ALLOWED_ORIGINS === "*";
const allowedOrigins = new Set(
  config.CORS_ALLOWED_ORIGINS.split(",").map((value) => value.trim()),
);
app.use(
  cors({
    origin: (origin, callback) =>
      callback(null, allOrigins || !origin || allowedOrigins.has(origin)),
    credentials: true,
  }),
);
app.use("/api/v1/admin/media", express.json({ limit: "2200kb" }));
app.use("/api/v1/admin/content", express.json({ limit: "150kb" }));
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  if (
    !allOrigins &&
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    !allowedOrigins.has(req.headers.origin || "")
  )
    return res
      .status(403)
      .json({ error: { message: "Request origin is not trusted" } });
  next();
});
app.use(
  "/api",
  rateLimit({
    windowMs: 60000,
    // Browser regressions deliberately visit dozens of routes in one minute.
    limit: config.NODE_ENV === "test" ? 2000 : 180,
    message: {
      error: {
        message: "Too many requests. Please wait a minute and try again.",
      },
    },
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);
app.use(
  "/api/v1/auth",
  rateLimit({
    windowMs: 15 * 60000,
    limit: config.NODE_ENV === "test" ? 200 : 40,
    message: {
      error: { message: "Too many sign-in attempts. Please try again later." },
    },
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
  auth,
);
app.get("/api/v1/health", (_req, res) =>
  ok(res, {
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "unavailable",
  }),
);
app.get(
  "/api/v1/services",
  wrap(async (_req, res) => {
    const rows = await Service.find({ active: true }).sort({
      sortOrder: 1,
      createdAt: 1,
    });
    ok(res, rows);
  }),
);
app.get(
  "/api/v1/services/:slug",
  wrap(async (req, res) => {
    const s = await Service.findOne({ slug: req.params.slug, active: true });
    if (!s) throw new HttpError(404, "Service not found");
    ok(res, s);
  }),
);
app.get("/api/v1/faqs", (_req, res) => ok(res, faqs));
app.get(
  "/api/v1/public/settings",
  wrap(async (_req, res) => {
    const business = await BusinessSettings.findOne({ key: "business" });
    ok(res, {
      name: "Atharv Enterprises",
      location: business?.location || "Pune, Maharashtra",
      phone: business
        ? business.phone || null
        : process.env.BUSINESS_PHONE || company.phones[0],
      email: business
        ? business.email || null
        : process.env.BUSINESS_EMAIL || company.emails[0],
      whatsapp: business
        ? business.whatsapp || null
        : process.env.BUSINESS_WHATSAPP || company.phones[0],
      address: business?.address || null,
      mapUrl: business?.mapUrl || null,
      areas,
    });
  }),
);
app.post(
  ["/api/v1/public/inquiries", "/api/v1/public/contact"],
  rateLimit({
    windowMs: 3600000,
    limit: 10,
    message: {
      error: { message: "Too many enquiries. Please try again later." },
    },
  }),
  wrap(async (req, res) => {
    const d = inquirySchema.parse(req.body);
    delete d.website;
    if (
      d.service !== "General inquiry" &&
      d.service !== "Career inquiry" &&
      !(await Service.exists({ slug: d.service, active: true }))
    )
      throw new HttpError(400, "Please choose an available service");
    let i = d.requestId
      ? await Inquiry.findOne({ requestId: d.requestId })
      : null;
    if (!i) {
      try {
        i = await Inquiry.create({ ...d, reference: id("ENQ") });
      } catch (error: any) {
        if (error.code !== 11000 || !d.requestId) throw error;
        i = await Inquiry.findOne({ requestId: d.requestId });
        if (!i) throw error;
      }
      // Generic notifications contain no enquiry or patient details.
      const recipients = await User.find({
        role: { $in: ["owner", "operations"] },
        active: true,
      }).select("_id");
      await Promise.allSettled(
        recipients.map((user: any) =>
          notify(
            user._id,
            "A new care enquiry is ready for review.",
            `inquiry:${i._id}:${user._id}`,
          ),
        ),
      );
    }
    ok(
      res,
      {
        reference: i.reference || String(i._id),
        message: "Thank you. Your inquiry has been received.",
      },
      201,
    );
  }),
);
app.use("/api/v1/portal", portal);
app.use("/api/v1/public", publicContent);
app.use("/api/v1/admin", contentAdmin);
app.use("/api/v1/admin", admin);
app.use(
  "/Photos",
  express.static(photosDirectory, { index: false, dotfiles: "deny" }),
);
if (existsSync("dist/index.html")) {
  app.use(express.static(resolve("dist")));
  app.get("/{*path}", (req, res, next) =>
    req.path.startsWith("/api/")
      ? next()
      : res.sendFile(resolve("dist/index.html")),
  );
}
app.use((_req, res) =>
  res.status(404).json({ error: { message: "This resource was not found" } }),
);
app.use(
  (
    error: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const validation = error instanceof ZodError;
    const status = validation
      ? 400
      : error instanceof HttpError
        ? error.status
        : error?.code === 11000
          ? 409
          : error?.name === "CastError"
            ? 400
            : 500;
    if (status === 500)
      log.error({ name: error.name, code: error.code }, "Request failed");
    res.status(status).json({
      error: {
        message: validation
          ? error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; ")
          : status === 500
            ? "Something went wrong. Please try again."
            : status === 409 && error?.code === 11000
              ? "This record already exists"
              : error.message,
      },
    });
  },
);
