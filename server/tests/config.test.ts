import { describe, expect, it } from "vitest";
import { parseConfig } from "../src/config.js";

const base = {
  MONGODB_URI: "mongodb://127.0.0.1/test",
  JWT_ACCESS_SECRET: "fictional-test-secret-".repeat(4),
};
describe("deployment cookie configuration", () => {
  it("keeps local cookies strict by default", () => {
    expect(parseConfig(base).COOKIE_SAME_SITE).toBe("strict");
  });
  it("allows cross-site cookies only with production HTTPS", () => {
    expect(
      parseConfig({
        ...base,
        NODE_ENV: "production",
        CLIENT_URL: "https://care.example.test",
        COOKIE_SAME_SITE: "none",
      }).COOKIE_SAME_SITE,
    ).toBe("none");
    expect(() => parseConfig({ ...base, COOKIE_SAME_SITE: "none" })).toThrow(
      "Secure cookies",
    );
    expect(() =>
      parseConfig({
        ...base,
        NODE_ENV: "production",
        COOKIE_SAME_SITE: "none",
      }),
    ).toThrow("HTTPS");
  });
});
