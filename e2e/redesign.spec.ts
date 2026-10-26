import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
const widths = [360, 390, 768, 1024, 1440, 1920];
async function signIn(page: import("@playwright/test").Page, role: string) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const users = JSON.parse(await readFile(".runtime/e2e-users.json", "utf8"));
  const res = await page.request.post("/api/v1/auth/login", {
    headers: { Origin: "http://127.0.0.1:5174" },
    data: users[role],
  });
  expect(res.ok()).toBeTruthy();
  await page.goto("/portal");
}
test("portal entry has a real sign-in form, password visibility and recovery states", async ({
  page,
}) => {
  await page.goto("/portal");
  await expect(
    page.getByRole("heading", {
      name: "A little less worry. A lot more connection.",
    }),
  ).toBeVisible();
  await page.getByLabel("Email address").fill("unknown@example.test");
  await page.getByLabel("Password", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByRole("button", { name: "Hide password" }).click();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Email or password is incorrect",
  );
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await page.getByLabel("Email address").fill("unknown@example.test");
  await page
    .getByRole("button", { name: "Send recovery instructions" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Check your inbox." }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/redesign-recovery.png",
    fullPage: true,
  });
});
test("homepage and portal entry fit all six required viewport widths with working local images", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["/", "/portal"]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.evaluate(async () => {
        await Promise.all(
          Array.from(document.querySelectorAll("img")).map((img) => {
            img.loading = "eager";
            return img.decode().catch(() => {});
          }),
        );
      });
      await expect
        .poll(
          () =>
            page.evaluate(
              () =>
                document.documentElement.scrollWidth <= window.innerWidth + 1,
            ),
          `${route} at ${width}px`,
        )
        .toBe(true);
      const broken = await page
        .locator("img")
        .evaluateAll((images) =>
          images
            .filter((i) => !(i as HTMLImageElement).naturalWidth)
            .map((i) => (i as HTMLImageElement).src),
        );
      expect(broken).toEqual([]);
      if ([390, 1440].includes(width))
        await page.screenshot({
          path: `test-results/redesign-${route === "/" ? "home" : "portal"}-${width}.png`,
          fullPage: true,
        });
    }
  }
});
test("navigation dropdown supports keyboard use and FAQ search filters content", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle services menu" }).click();
  await expect(page.locator("#service-dropdown")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#service-dropdown")).toHaveCount(0);
  await page.getByLabel("Search care questions").fill("cancel");
  await page.getByRole("button", { name: "What if I need to cancel?" }).click();
  await expect(
    page.getByRole("region", { name: "What if I need to cancel?" }),
  ).toContainText("Cancellation request");
  await page.getByLabel("Search care questions").fill("no-such-question-xyz");
  await expect(
    page.getByText("No matching questions.", { exact: false }),
  ).toBeVisible();
});
test("client dashboard uses real requests, supports calendar navigation and illustrated billing", async ({
  page,
}) => {
  await signIn(page, "client");
  await expect(page.getByText("AE-E2E-FIXTURE")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your care requests", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next month" }).click();
  await page.getByRole("button", { name: "Previous month" }).click();
  await page
    .getByRole("button", { name: "Review invoices", exact: true })
    .click();
  await expect(page.getByText("INV-FICTIONAL-E2E")).toBeVisible();
  await page
    .getByRole("navigation", { name: "Care portal" })
    .getByRole("button", { name: "Overview", exact: true })
    .click();
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(
        () =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth + 1,
          ),
        `client ${width}`,
      )
      .toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.screenshot({
    path: "test-results/redesign-client-dashboard.png",
    fullPage: true,
  });
});
test("caregiver dashboard exposes only assigned work and an authorized profile", async ({
  page,
}) => {
  await signIn(page, "caregiver");
  await expect(page.getByText("You bring the human touch.")).toBeVisible();
  await expect(
    page.getByText("Fictional Caregiver", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Care portal" })
      .getByRole("button", { name: "Billing", exact: true }),
  ).toHaveCount(0);
  expect((await page.request.get("/api/v1/admin/bookings")).status()).toBe(403);
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(
        () =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth + 1,
          ),
        `caregiver ${width}`,
      )
      .toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/redesign-caregiver-dashboard.png",
    fullPage: true,
  });
});
test("owner dashboard shows live chart data and the quote form is an accessible dialog", async ({
  page,
}) => {
  await signIn(page, "owner");
  await expect(
    page.getByRole("heading", { name: "Billing & recorded collections" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Care portal" })
    .getByRole("button", { name: "Bookings", exact: true })
    .click();
  const booking = page
    .locator(".booking-card")
    .filter({ hasText: "AE-E2E-FIXTURE" });
  await booking.getByRole("button", { name: "Begin assessment" }).click();
  await booking.getByRole("button", { name: "Prepare quote" }).click();
  const dialog = page.getByRole("dialog", { name: "Quote" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Quote amount (INR)")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(booking.getByRole('button',{name:'Prepare quote'})).toBeFocused();
  await page
    .getByRole("navigation", { name: "Care portal" })
    .getByRole("button", { name: "Overview", exact: true })
    .click();
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(
        () =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth + 1,
          ),
        `owner ${width}`,
      )
      .toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.screenshot({
    path: "test-results/redesign-owner-dashboard.png",
    fullPage: true,
  });
});
test("accountant overview does not request patient or caregiver records", async ({
  page,
}) => {
  const forbiddenRequests: string[] = [];
  page.on("request", (req) => {
    if (
      /\/api\/v1\/(portal\/(bookings|shifts|assignments)|admin\/(bookings|caregivers))/.test(
        req.url(),
      )
    )
      forbiddenRequests.push(req.url());
  });
  await signIn(page, "accountant");
  await expect(
    page.getByRole("heading", { name: "Billing & recorded collections" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Care portal" })
      .getByRole("button", { name: "Bookings", exact: true }),
  ).toHaveCount(0);
  expect(forbiddenRequests).toEqual([]);
});
