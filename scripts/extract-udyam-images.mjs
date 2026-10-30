import fs from "fs";
import zlib from "zlib";
import { PNG } from "pngjs";

const pdf = fs.readFileSync(
  "c:/Users/rohan/.cursor/projects/d-Dsofts-Projects-Atharv-Enterprises-atharv-care/attachments/a2e5808f-7052-4a23-8446-7b2edccc264b/Atharv_Enter__Print___Udyam_Registration_Certificate.pdf",
);
const outdir =
  "c:/Users/rohan/.cursor/projects/d-Dsofts-Projects-Atharv-Enterprises-atharv-care/attachments";
const marker = Buffer.from("stream");
let idx = 0;
let n = 0;
while ((idx = pdf.indexOf(marker, idx + 1)) !== -1) {
  const dict = pdf.slice(Math.max(0, idx - 400), idx).toString("latin1");
  let s = idx + 6;
  if (pdf[s] === 10) s++;
  else if (pdf[s] === 13) {
    s++;
    if (pdf[s] === 10) s++;
  }
  const end = pdf.indexOf(Buffer.from("endstream"), s);
  if (end < 0) continue;
  const raw = pdf.slice(s, end);
  n++;
  const widthMatch = dict.match(/\/Width\s+(\d+)/);
  const heightMatch = dict.match(/\/Height\s+(\d+)/);
  if (!/Subtype \/Image/.test(dict) || !widthMatch || !heightMatch) continue;
  const w = Number(widthMatch[1]);
  const h = Number(heightMatch[1]);
  let pixels;
  try {
    pixels = /FlateDecode/.test(dict) ? zlib.inflateSync(raw) : raw;
  } catch (e) {
    console.log("fail", n, e.message);
    continue;
  }
  const png = new PNG({ width: w, height: h });
  const expected = w * h * 3;
  const gray = w * h;
  if (pixels.length >= expected) {
    for (let i = 0, j = 0; i < expected; i += 3, j += 4) {
      png.data[j] = pixels[i];
      png.data[j + 1] = pixels[i + 1];
      png.data[j + 2] = pixels[i + 2];
      png.data[j + 3] = 255;
    }
  } else if (pixels.length >= gray) {
    for (let i = 0, j = 0; i < gray; i++, j += 4) {
      png.data[j] = png.data[j + 1] = png.data[j + 2] = pixels[i];
      png.data[j + 3] = 255;
    }
  } else {
    console.log("size mismatch", n, pixels.length, expected, gray);
    continue;
  }
  const file = `${outdir}/udyam-img-${n}-${w}x${h}.png`;
  fs.writeFileSync(file, PNG.sync.write(png));
  console.log("wrote", file, pixels.length);
}
