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
import { Service, Inquiry } from "./models.js";
import { services, faqs, areas } from "../../shared/catalog.js";
import { inquirySchema } from "../../shared/schemas.js";
import { wrap, ok, HttpError, log } from "./lib.js";
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
// Reflect the requesting origin: wildcard origins cannot be used with cookies.
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use(
  "/api",
  rateLimit({
    windowMs: 60000,
    limit: 180,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);
app.use(
  "/api/v1/auth",
  rateLimit({
    windowMs: 15 * 60000,
    limit: 40,
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
    const rows = await Service.find({ active: true });
    ok(res, rows.length ? rows : services);
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
app.get("/api/v1/public/settings", (_req, res) =>
  ok(res, {
    name: "Atharv Enterprises",
    location: "Pune, Maharashtra",
    phone: process.env.BUSINESS_PHONE || null,
    email: process.env.BUSINESS_EMAIL || null,
    whatsapp: process.env.BUSINESS_WHATSAPP || null,
    areas,
  }),
);
app.post(
  ["/api/v1/public/inquiries", "/api/v1/public/contact"],
  rateLimit({ windowMs: 3600000, limit: 10 }),
  wrap(async (req, res) => {
    const d = inquirySchema.parse(req.body);
    const i = await Inquiry.create(d);
    ok(
      res,
      {
        reference: String(i._id),
        message: "Thank you. Your inquiry has been received.",
      },
      201,
    );
  }),
);
app.use("/api/v1/portal", portal);
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
