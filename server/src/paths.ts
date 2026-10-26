import { resolve } from "node:path";
import { existsSync } from "node:fs";

// The supplied photo assets stay beside the application directory.
const originalPhotos = resolve(process.cwd(), "..", "Photos");
export const photosDirectory = existsSync(resolve(originalPhotos, "Logo.png"))
  ? originalPhotos
  : resolve(process.cwd(), "public", "Photos");
export const logoPath = resolve(photosDirectory, "Logo.png");
