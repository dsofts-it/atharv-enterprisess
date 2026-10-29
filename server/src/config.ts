import "dotenv/config";
import { z } from "zod";
const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().url().default("http://127.0.0.1:5173"),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(48),
  COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("strict"),
  CORS_ALLOWED_ORIGINS: z.string().default("*"),
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});
export function parseConfig(source: NodeJS.ProcessEnv) {
  const env = environmentSchema.parse(source);
  if (env.CORS_ALLOWED_ORIGINS !== "*") {
    for (const origin of env.CORS_ALLOWED_ORIGINS.split(",").map((value) =>
      value.trim(),
    )) {
      const url = new URL(origin);
      if (url.origin !== origin || !["https:", "http:"].includes(url.protocol))
        throw new Error(
          "CORS_ALLOWED_ORIGINS must contain exact HTTP(S) origins without trailing slashes",
        );
    }
  }
  if (env.NODE_ENV === "production" && !env.CLIENT_URL.startsWith("https://"))
    throw new Error("Production requires HTTPS");
  if (env.COOKIE_SAME_SITE === "none" && env.NODE_ENV !== "production")
    throw new Error(
      "Cross-site cookies require production HTTPS (Secure cookies)",
    );
  return env;
}
export const config = parseConfig(process.env);
