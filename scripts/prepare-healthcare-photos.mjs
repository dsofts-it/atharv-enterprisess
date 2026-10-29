import { resolve } from "node:path";
import { chromium } from "playwright";
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
const manifest = JSON.parse(
  (await readFile("scripts/healthcare-photo-sources.json", "utf8")).replace(
    /^\uFEFF/,
    "",
  ),
);
await mkdir("public/images/healthcare", { recursive: true });
await mkdir("output/imagegen/healthcare", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
const page = await browser.newPage();
for (const item of manifest) {
  if (!item.source) throw Error("Missing " + item.slug);
  if (
    resolve(item.source) !==
    resolve(`output/imagegen/healthcare/${item.slug}.png`)
  )
    await copyFile(item.source, `output/imagegen/healthcare/${item.slug}.png`);
  const raw = await readFile(item.source);
  const data = await page.evaluate(
    async ({ b64, size }) => {
      const img = new Image();
      img.src = "data:image/png;base64," + b64;
      await img.decode();
      const scale = Math.min(1, size / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/webp", 0.84).split(",")[1];
    },
    { b64: raw.toString("base64"), size: item.slug === "hero" ? 1200 : 900 },
  );
  await writeFile(
    `public/images/healthcare/${item.slug}.webp`,
    Buffer.from(data, "base64"),
  );
  console.log(item.slug);
}
await browser.close();
