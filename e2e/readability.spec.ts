import { test, expect } from "@playwright/test";

test("care information stays readable with sufficient contrast across screen sizes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["/", "/portal"]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const findings = await page.evaluate(() => {
        const selectors = [
          ".hc-lead",
          ".hc-card-body > p",
          ".hc-actions .button",
          ".hc-hero h1",
          ".hc-faq summary",
          ".hc-faq details p",
          ".hc-footer p",
          ".hc-footer h3",
          ".service-body > p",
          ".hero-buttons .button",
          ".faq-item h3 > button",
          ".hero-copy h1",
          ".headline-mask em",
          ".hero-assurance div > span",
          ".footer-grid p",
          ".signin-card .field label",
          ".portal-welcome > p:not(.eyebrow)",
        ];
        const parse = (color: string) =>
          color.match(/[\d.]+/g)?.map(Number) ?? [];
        const luminance = (rgb: number[]) =>
          rgb
            .slice(0, 3)
            .map((v) => {
              const s = v / 255;
              return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            })
            .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
        return selectors.flatMap((selector) =>
          Array.from(document.querySelectorAll(selector))
            .filter((el) => el.getClientRects().length)
            .map((el) => {
              const style = getComputedStyle(el);
              const foreground = luminance(parse(style.color));
              let current: Element | null = el;
              let backgrounds: number[][] = [[255, 255, 255]];
              while (current) {
                const ancestor = getComputedStyle(current);
                const gradient =
                  ancestor.backgroundImage.match(/rgba?\([^)]+\)/g);
                const solid = parse(ancestor.backgroundColor);
                if (gradient) {
                  backgrounds = gradient.map(parse);
                  break;
                }
                if (solid.length === 3 || solid[3] === 1) {
                  backgrounds = [solid];
                  break;
                }
                current = current.parentElement;
              }
              const contrast = Math.min(
                ...backgrounds.map((rgb) => {
                  const background = luminance(rgb);
                  return (
                    (Math.max(foreground, background) + 0.05) /
                    (Math.min(foreground, background) + 0.05)
                  );
                }),
              );
              return {
                selector,
                text: el.textContent?.slice(0, 50),
                size: parseFloat(style.fontSize),
                contrast,
              };
            }),
        );
      });
      expect(findings.length).toBeGreaterThan(0);
      expect(
        findings.filter((item) => item.size < 14 || item.contrast < 4.5),
        `${route} at ${width}px`,
      ).toEqual([]);
      const heading = page.locator("h1");
      expect(
        await heading.evaluate((el) =>
          parseFloat(getComputedStyle(el).fontSize),
        ),
      ).toBeGreaterThanOrEqual(32);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
    }
  }
});
