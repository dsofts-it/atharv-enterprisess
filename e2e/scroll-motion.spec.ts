import { test, expect } from "@playwright/test";

test("service cards reveal once, preserve routes and lift without resizing", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const cards = page.locator(".premium-services > div");
  await expect(cards).toHaveCount(6);
  const card = cards.first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveCSS("opacity", "1");
  await expect(card).toHaveCSS("transform", "none");
  const article = card.locator("article");
  const before = await article.boundingBox();
  await article.hover();
  await expect(article).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -5)");
  const after = await article.boundingBox();
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveCSS("opacity", "1");
  await expect(card).toHaveCSS("transform", "none");
  for (const link of await page
    .locator(".service-links > a:first-child")
    .all()) {
    const route = await link.getAttribute("href");
    expect(route).toMatch(/^\/services\//);
    expect((await page.request.get(route!)).ok()).toBeTruthy();
  }
  expect(errors).toEqual([]);
});

test("service cards fit required widths with aligned actions and contained illustrations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    const gallery = page.locator(".premium-services");
    await gallery.scrollIntoViewIfNeeded();
    const columns = await gallery.evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
    );
    expect(columns).toBe(width >= 1024 ? 3 : width >= 600 ? 2 : 1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    const cards = page.locator(".premium-services article");
    for (let i = 0; i < 6; i++) {
      const image = cards.nth(i).locator("img");
      await image.evaluate(async (el: HTMLImageElement) => {
        el.loading = "eager";
        await el.decode();
      });
      await expect(image).toHaveCSS("object-fit", "contain");
      const box = await cards.nth(i).boundingBox();
      expect(box!.width).toBeLessThanOrEqual(width);
      if (i % columns !== 0) {
        const previous = await cards
          .nth(i - 1)
          .locator(".service-links")
          .boundingBox();
        const action = await cards
          .nth(i)
          .locator(".service-links")
          .boundingBox();
        expect(Math.abs(previous!.y - action!.y)).toBeLessThan(1);
      }
    }
    await gallery.screenshot({ path: `test-results/services-${width}.png` });
  }
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
