import { test, expect } from "@playwright/test";
test("public browsing, progressive sign-in and private care request", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Care that feels/ }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Find the right care", exact: true })
    .click();
  await page.getByLabel("Pune locality").selectOption("Baner");
  await page.getByLabel("Preferred start date").fill("2030-01-01");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/login/);
  await page.getByRole("button", { name: "Create an account" }).click();
  await page.getByLabel("Your name").fill("Fictional E2E Client");
  await page.getByLabel("Email address").fill(`e2e-${Date.now()}@example.test`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("Fictional-only-Password-932!");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL(/request-care/);
  await expect(page.getByLabel("Pune locality")).toHaveValue("Baner");
  await page.getByLabel("Preferred start date").fill("2030-01-01");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Patient’s preferred name").fill("Fictional Relative");
  await page
    .getByLabel("Relevant support needs")
    .fill("Test only: everyday companionship.");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Submit care request" }).click();
  await expect(
    page.getByRole("heading", { name: "Your care conversation has begun." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Go to your care portal" }).click();
  await expect(
    page.getByText("Fictional Relative", { exact: false }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/client-portal.png",
    fullPage: true,
  });
});
test("mobile navigation, reduced motion and no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Our services" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "The right support makes all the difference.",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/");
  await page.screenshot({
    path: "test-results/mobile-home.png",
    fullPage: true,
  });
});
test("desktop homepage and service detail", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".hero-copy")).toHaveCSS("opacity", "1");
  await page
    .locator(".hero-photo img")
    .evaluate((img: HTMLImageElement) => img.decode());
  expect(
    await page
      .locator(".hero-photo img")
      .evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBeGreaterThan(0);
  await page.screenshot({
    path: "test-results/desktop-home.png",
    fullPage: true,
  });
  await page.goto("/services/home-nursing");
  await expect(
    page.getByRole("heading", { name: "Home nursing", exact: true }),
  ).toBeVisible();
  await page
    .getByText("What is the difference between a nurse and an attendant?")
    .click();
  await expect(
    page.getByText("Qualified nurses may perform authorized clinical tasks.", {
      exact: false,
    }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
