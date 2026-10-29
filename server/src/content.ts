import { Router } from "express";
import { z } from "zod";
import { authenticate, roles } from "./auth.js";
import { Content, Media, BusinessSettings } from "./models.js";
import { wrap, ok, assert, audit } from "./lib.js";

export const publicContent = Router();
publicContent.get(
  "/content",
  wrap(async (_req, res) =>
    ok(
      res,
      await Content.find({ published: true, approved: true })
        .populate("imageId", "alt illustrative")
        .sort({ sortOrder: 1 })
        .limit(100),
    ),
  ),
);
publicContent.get(
  "/media/:id/info",
  wrap(async (req, res) => {
    assert(
      /^[a-f\d]{24}$/i.test(String(req.params.id)),
      404,
      "Image not found",
    );
    const media = await Media.findById(req.params.id).select(
      "alt illustrative",
    );
    assert(media, 404, "Image not found");
    ok(res, media);
  }),
);
publicContent.get(
  "/media/:id",
  wrap(async (req, res) => {
    assert(
      /^[a-f\d]{24}$/i.test(String(req.params.id)),
      404,
      "Image not found",
    );
    const media = await Media.findById(req.params.id);
    assert(media, 404, "Image not found");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.type(media.contentType).send(media.data);
  }),
);
export const contentAdmin = Router();
contentAdmin.use(
  ["/content", "/media", "/business-settings"],
  authenticate,
  roles("owner"),
);
contentAdmin.get(
  "/business-settings",
  wrap(async (_req, res) =>
    ok(
      res,
      (await BusinessSettings.findOne({ key: "business" })) || {
        phone: process.env.BUSINESS_PHONE || "",
        email: process.env.BUSINESS_EMAIL || "",
        whatsapp: process.env.BUSINESS_WHATSAPP || "",
        location: "Pune, Maharashtra",
        address: "",
        mapUrl: "",
      },
    ),
  ),
);
contentAdmin.patch(
  "/business-settings",
  wrap(async (req, res) => {
    const phone = z.union([
      z.string().regex(/^(?:\+91)?[6-9]\d{9}$/),
      z.literal(""),
    ]);
    const data = z
      .object({
        phone,
        whatsapp: phone,
        email: z.union([z.string().email().max(200), z.literal("")]),
        location: z.string().trim().min(2).max(120),
        address: z.string().trim().max(500),
        mapUrl: z.union([
          z.string().url().startsWith("https://"),
          z.literal(""),
        ]),
        verified: z.literal(true),
      })
      .strict()
      .parse(req.body);
    const { verified, ...fields } = data;
    assert(verified, 400, "Verify the business contact details");
    const row = await BusinessSettings.findOneAndUpdate(
      { key: "business" },
      { $set: fields },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
    await audit(req.user._id, "business-settings.updated", String(row._id));
    ok(res, row);
  }),
);
contentAdmin.get(
  "/media",
  wrap(async (_req, res) =>
    ok(
      res,
      await Media.find()
        .select("alt illustrative createdAt")
        .sort({ createdAt: -1 })
        .limit(100),
    ),
  ),
);
const translated = z
  .object({
    en: z.string().trim().min(1).max(300),
    hi: z.string().trim().min(1).max(300),
    mr: z.string().trim().min(1).max(300),
  })
  .strict();
const input = z
  .object({
    kind: z.enum([
      "banner",
      "about",
      "faq",
      "testimonial",
      "gallery",
      "video",
      "blog",
      "contact",
    ]),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(100),
    title: translated,
    body: z
      .object({
        en: z.string().max(10000),
        hi: z.string().max(10000),
        mr: z.string().max(10000),
      })
      .strict(),
    imageId: z
      .string()
      .regex(/^[a-f\d]{24}$/i)
      .nullable()
      .optional(),
    externalUrl: z
      .union([z.string().url().startsWith("https://"), z.literal("")])
      .optional(),
    approved: z.boolean(),
    published: z.boolean(),
    sortOrder: z.number().int().min(0).max(1000),
  })
  .strict();
contentAdmin.get(
  "/content",
  wrap(async (_req, res) =>
    ok(res, await Content.find().sort({ sortOrder: 1 }).limit(200)),
  ),
);
contentAdmin.post(
  "/content",
  wrap(async (req, res) => {
    const data = input.parse(req.body);
    assert(
      !data.published || data.approved,
      400,
      "Approve the content before publishing",
    );
    if (data.imageId)
      assert(await Media.exists({ _id: data.imageId }), 400, "Image not found");
    const row = await Content.create(data);
    await audit(req.user._id, "content.created", String(row._id));
    ok(res, row, 201);
  }),
);
contentAdmin.patch(
  "/content/:id",
  wrap(async (req, res) => {
    const data = input.parse(req.body);
    assert(
      !data.published || data.approved,
      400,
      "Approve the content before publishing",
    );
    if (data.imageId)
      assert(await Media.exists({ _id: data.imageId }), 400, "Image not found");
    const row = await Content.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { returnDocument: "after", runValidators: true },
    );
    assert(row, 404, "Content not found");
    await audit(req.user._id, "content.updated", String(row._id));
    ok(res, row);
  }),
);
contentAdmin.post(
  "/media",
  wrap(async (req, res) => {
    const data = z
      .object({
        base64: z.string().max(2100000),
        alt: translated,
        illustrative: z.boolean(),
        consent: z.literal(true),
      })
      .strict()
      .parse(req.body);
    assert(
      /^[A-Za-z0-9+/]+={0,2}$/.test(data.base64),
      400,
      "Invalid image data",
    );
    const bytes = Buffer.from(data.base64, "base64");
    assert(
      bytes.length > 12 && bytes.length <= 1500000,
      400,
      "Image must be smaller than 1.5 MB",
    );
    const type = bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      ? "image/png"
      : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        ? "image/jpeg"
        : bytes.toString("ascii", 0, 4) === "RIFF" &&
            bytes.toString("ascii", 8, 12) === "WEBP"
          ? "image/webp"
          : null;
    assert(type, 400, "Only PNG, JPEG and WebP photographs are accepted");
    const row = await Media.create({
      data: bytes,
      contentType: type,
      alt: data.alt,
      illustrative: data.illustrative,
    });
    await audit(req.user._id, "media.created", String(row._id));
    ok(res, { id: row._id, alt: row.alt, illustrative: row.illustrative }, 201);
  }),
);
