import { mkdir, writeFile } from "node:fs/promises";
const origin = new URL(
  process.env.VITE_SITE_ORIGIN || "https://atharv-enterprises-8uv.pages.dev",
).origin;
const paths = [
  "",
  "/services",
  "/find-care",
  "/enquire",
  "/about",
  "/how-it-works",
  "/faq",
  "/contact",
  "/gallery",
  "/resources",
  "/privacy-policy",
  "/booking-terms",
  "/cancellation-policy",
  ...[
    "home-nursing",
    "elderly-care",
    "patient-attendant",
    "post-operative-care",
    "24-hour-care",
    "bedridden-care",
    "injection-dressing",
    "vital-signs-monitoring",
    "medication-assistance",
    "wound-care",
    "physiotherapy-support",
    "mother-baby-care",
  ].map((s) => "/services/" + s),
];
await mkdir("dist", { recursive: true });
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nDisallow: /portal\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`,
);
await writeFile(
  "dist/sitemap.xml",
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    paths.map((p) => `<url><loc>${origin}${p}</loc></url>`).join("") +
    "</urlset>",
);
console.log("Generated static sitemap and robots for " + origin);
