import fs from "fs";

const files = [
  "c:/Users/rohan/.cursor/projects/d-Dsofts-Projects-Atharv-Enterprises-atharv-care/attachments/content-13.txt",
  "c:/Users/rohan/.cursor/projects/d-Dsofts-Projects-Atharv-Enterprises-atharv-care/attachments/content-15.txt",
  "c:/Users/rohan/.cursor/projects/d-Dsofts-Projects-Atharv-Enterprises-atharv-care/attachments/content-17.txt",
];

function decodeHex(hex) {
  const out = [];
  for (let i = 0; i < hex.length; i += 4) {
    const cid = parseInt(hex.slice(i, i + 4), 16);
    const code = cid + 0x1d;
    out.push(code >= 32 && code < 127 ? String.fromCharCode(code) : `\\u${code.toString(16)}`);
  }
  return out.join("");
}

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const parts = [];
  const re = /(?:\/ActualText\s*<FEFF([0-9A-Fa-f]+)>\s*>>\s*BDC\s*)?<([0-9A-Fa-f]+)>\s*Tj/g;
  let m;
  while ((m = re.exec(text))) {
    if (m[1]) {
      const actual = m[1]
        .match(/.{4}/g)
        .map((h) => String.fromCharCode(parseInt(h, 16)))
        .join("");
      parts.push(actual);
    } else {
      parts.push(decodeHex(m[2]));
    }
  }
  console.log("\n====", file.split("/").pop(), "====");
  console.log(parts.join("").replace(/ +/g, " "));
}
