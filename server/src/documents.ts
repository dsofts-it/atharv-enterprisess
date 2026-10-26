import PDFDocument from "pdfkit";
import type { Response } from "express";
import { existsSync } from "node:fs";
import { logoPath } from "./paths.js";
export function pdf(
  res: Response,
  title: string,
  lines: string[],
  filename: string,
) {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}.pdf"`,
  );
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);
  if (existsSync(logoPath)) doc.image(logoPath, 50, 40, { width: 60 });
  doc.fontSize(19).text("Atharv Enterprises", 125, 55);
  doc.fontSize(10).text("Nursing care | Pune, Maharashtra", 125, 80);
  doc.moveDown(4).fontSize(17).text(title);
  doc.moveDown().fontSize(11);
  for (const line of lines) doc.text(line).moveDown();
  doc.end();
}
