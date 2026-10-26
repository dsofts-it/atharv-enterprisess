import { test, expect } from "@playwright/test";
test("visible sections move with scroll and animate again when revisited", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const card = page.locator(".service-gallery>[data-scroll-motion]").first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveAttribute("data-reveal-state", "visible");
  await expect(card).toHaveCSS("opacity", "1");
  const initialCount = Number(await card.getAttribute("data-reveal-count"));
  await page.waitForTimeout(250);
  const before = await card.evaluate((el) => getComputedStyle(el).transform);
  await page.evaluate(() => window.scrollBy({ top: 160, behavior: "instant" }));
  await expect
    .poll(() => card.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(before);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(card).toHaveAttribute("data-reveal-state", "outside");
  await card.scrollIntoViewIfNeeded();
  await expect
    .poll(async () => Number(await card.getAttribute("data-reveal-count")))
    .toBeGreaterThan(initialCount);
  await expect(card).toHaveCSS("opacity", "1");
  const bar = page.locator("[data-scroll-progress]");
  await expect
    .poll(() =>
      bar.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a),
    )
    .toBeGreaterThan(0.05);
});
test("reduced motion keeps content static and available while scrolling", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const card = page.locator(".service-gallery>[data-scroll-motion]").first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveCSS("opacity", "1");
  await expect(card).toHaveCSS("transform", "none");
  await page.evaluate(() => window.scrollBy({ top: 130, behavior: "instant" }));
  await expect(card).toHaveCSS("transform", "none");
  await expect(page.locator(".service-art img").first()).toHaveCSS(
    "transform",
    "none",
  );
});
test("homepage illustrations are distinct and fonts are served locally", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const images = await page
    .locator(".care-illustration")
    .evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLImageElement).getAttribute("src")),
    );
  expect(new Set(images).size).toBe(images.length);
  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images).map((image) => {
        image.loading = "eager";
        return image.decode();
      }),
    );
  });
  expect(
    await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).fontFamily),
  ).toContain("DM Sans Variable");
  expect(
    await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily),
  ).toContain("Manrope Variable");
  const fonts = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((r) => r.name.includes("woff2"))
      .map((r) => r.name),
  );
  expect(fonts.length).toBeGreaterThan(0);
  expect(fonts.every((url) => url.startsWith("http://127.0.0.1:5174/"))).toBe(
    true,
  );
});
