import { chromium } from "playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const manifest = JSON.parse(
  (await readFile("scripts/healthcare-photo-sources.json", "utf8")).replace(
    /^\uFEFF/,
    "",
  ),
);
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
const page = await browser.newPage();
const data = [];
for (const item of manifest)
  data.push({
    slug: item.slug,
    base64: (
      await readFile(`public/images/healthcare/${item.slug}.webp`)
    ).toString("base64"),
  });
const result = await page.evaluate(async (data) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 4 * 245;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f1f7f8";
  ctx.fillRect(0, 0, 1280, 980);
  for (let i = 0; i < data.length; i++) {
    const image = new Image();
    image.src = "data:image/webp;base64," + data[i].base64;
    await image.decode();
    const x = (i % 4) * 320 + 10,
      y = Math.floor(i / 4) * 245 + 10;
    ctx.drawImage(image, x, y, 300, 200);
    ctx.fillStyle = "#122c42";
    ctx.font = "16px sans-serif";
    ctx.fillText(data[i].slug, x, y + 225);
  }
  return canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
}, data);
await mkdir("output/qa", { recursive: true });
await writeFile(
  "output/qa/healthcare-photo-contact-sheet.jpg",
  Buffer.from(result, "base64"),
);
await browser.close();
