import { test, expect } from "@playwright/test";

test("new visitor can explore nursing and keep care preferences through sign-in", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Find the right care" }).click();
  await expect(page).toHaveURL(/\/find-care$/);
  await page.getByRole("radio", { name: /Home nursing/ }).check();
  await expect(page.getByRole("link", { name: "See scope and details" })).toHaveAttribute("href", "/services/home-nursing");
  await page.getByRole("link", { name: "Request this care" }).click();
  await expect(page.getByLabel("What kind of care?")).toHaveValue("home-nursing");
  await page.getByLabel("Pune locality").selectOption({ index: 1 });
  await page.getByLabel("Preferred start date").fill("2030-01-15");
  await page.getByLabel("Preferred shift").selectOption("Night");
  await page.getByLabel("Estimated duration (days)").fill("14");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/request-care");
  await expect(page.getByLabel("Preferred start date")).toHaveValue("2030-01-15");
  await expect(page.getByLabel("Preferred shift")).toHaveValue("Night");
  await expect(page.getByLabel("Estimated duration (days)")).toHaveValue("14");
});

test("visitor unsure about care can reach the team without signing in", async ({ page }) => {
  await page.goto("/find-care");
  await page.getByRole("radio", { name: /I’m not sure yet/ }).check();
  await page.getByRole("link", { name: "Ask the care team", exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
});
