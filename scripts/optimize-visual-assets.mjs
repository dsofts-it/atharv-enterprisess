import { chromium } from "playwright";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
const page = await browser.newPage();
for (const [source, destination] of [
  [
    "public/images/home-care-illustrative.png",
    "public/images/hero/home-care.webp",
  ],
  [
    "public/images/illustrations/family-care-portal.png",
    "public/images/dashboard/family-care-portal.webp",
  ],
]) {
  await mkdir(destination.slice(0, destination.lastIndexOf("/")), {
    recursive: true,
  });
  const raw = await readFile(source);
  const data = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const scale = Math.min(1, 1200 / img.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", 0.88).split(",")[1];
  }, raw.toString("base64"));
  await writeFile(destination, Buffer.from(data, "base64"));
  console.log(
    `${destination}: ${Math.round((await stat(destination)).size / 1024)} KB`,
  );
}
await browser.close();
