import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("company registration and expanded services work in all three languages", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [language, companyHeading, search, serviceName] of [
    ["en", "Company details", "Injection", "Injection & dressing"],
    ["hi", "कंपनी की जानकारी", "इंजेक्शन", "इंजेक्शन और ड्रेसिंग"],
    ["mr", "कंपनीची माहिती", "इंजेक्शन", "इंजेक्शन व ड्रेसिंग"],
  ]) {
    await page.goto("/contact");
    await page.getByLabel("Language / भाषा").first().selectOption(language);
    const details = page.locator(".company-details");
    await expect(
      details.getByRole("heading", { name: companyHeading, exact: true }),
    ).toBeVisible();
    await expect(details).toContainText("UDYAM-MH-26-1192362");
    for (const number of ["9172662030", "8803602030"])
      await expect(details.getByRole("link", { name: number })).toHaveAttribute(
        "href",
        `tel:+91${number}`,
      );
    for (const pin of ["411052", "411018", "411058"])
      await expect(details).toContainText(pin);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
    await page.goto("/services");
    await expect(page.locator(".hc-service-card")).toHaveCount(12);
    await page.locator(".hc-filters input").fill(search);
    await expect(page.locator(".hc-service-card")).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: serviceName, exact: true }),
    ).toBeVisible();
    await page.goto("/services/injection-dressing");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      serviceName,
    );
    await expect(page.locator(".hc-detail article img")).toHaveJSProperty(
      "complete",
      true,
    );
    expect(
      await page
        .locator(".hc-detail article img")
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    ).toBeGreaterThan(0);
    await page.goto("/enquire?service=injection-dressing");
    await expect(page.locator("#enquiry-service")).toHaveValue(
      "injection-dressing",
    );
    await expect(page.locator("#enquiry-service option:checked")).toHaveText(
      serviceName,
    );
  }
  await page.goto("/about");
  await expect(page.locator(".company-details")).toContainText(
    "UDYAM-MH-26-1192362",
  );
  await page.screenshot({
    path: "output/qa/company-marathi-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/services");
  await page.getByLabel("Language / भाषा").first().selectOption("en");
  await expect(page.locator(".hc-service-card")).toHaveCount(12);
  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images).map(async (image) => {
        image.loading = "eager";
        await image.decode();
      }),
    );
  });
  await page.screenshot({
    path: "output/qa/expanded-services-desktop.png",
    fullPage: true,
  });
});

test("three languages persist, service filters work and gallery is keyboard accessible", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Compassionate care",
  );
  await page.getByLabel("Language / भाषा").first().selectOption("hi");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("अपनापन");
  await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("अपनापन");
  await page.getByLabel("Language / भाषा").first().selectOption("mr");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("आपुलकी");
  await page.goto("/services");
  await page
    .getByRole("button", { name: "वैद्यकीय देखभाल", exact: true })
    .click();
  await expect(page.locator(".hc-service-card")).toHaveCount(6);
  await expect(
    page.getByRole("heading", { name: "घरच्या घरी नर्सिंग सेवा", exact: true }),
  ).toBeVisible();
  await page.goto("/gallery");
  await page.locator(".hc-gallery-button").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Marathi enquiry is stored and owner can follow up in admin", async ({
  page,
}) => {
  await page.goto("/enquire?service=home-nursing");
  await page.getByLabel("Language / भाषा").first().selectOption("mr");
  await expect(page.getByLabel("आवश्यक सेवा", { exact: true })).toHaveValue(
    "home-nursing",
  );
  await page
    .getByLabel("पूर्ण नाव", { exact: true })
    .fill("Fictional Marathi Family");
  await page.getByLabel("मोबाईल क्रमांक", { exact: true }).fill("9876543210");
  await page.getByLabel("परिसर / भाग", { exact: true }).fill("Baner");
  await page
    .getByLabel("पसंतीची प्रारंभ तारीख", { exact: true })
    .fill("2030-01-15");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "चौकशी पाठवा", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("ENQ-");
  const users = JSON.parse(await readFile(".runtime/e2e-users.json", "utf8"));
  const login = await page.request.post("/api/v1/auth/login", {
    data: users.owner,
  });
  expect(login.ok()).toBeTruthy();
  await page.goto("/portal");
  await page.getByLabel("Language / भाषा").selectOption("en");
  await page.getByRole("button", { name: "Inquiries", exact: true }).click();
  await page.getByLabel("Search enquiries").fill("Fictional Marathi Family");
  await page.getByRole("button", { name: "View and follow up" }).click();
  await expect(page.getByRole("dialog")).toContainText("home-nursing");
  await page
    .getByRole("dialog")
    .getByLabel("Status", { exact: true })
    .selectOption("contacted");
  await expect(
    page.getByRole("dialog").getByLabel("Status", { exact: true }),
  ).toHaveValue("contacted");
  await page
    .getByLabel("Add internal note")
    .fill("Fictional follow-up completed");
  await page.getByRole("button", { name: "Save follow-up note" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Fictional follow-up completed",
  );
});

test("public pages fit phone, tablet and desktop with real images and no runtime errors", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/",
      "/services",
      "/find-care",
      "/enquire",
      "/gallery",
      "/services/home-nursing",
      "/about",
      "/how-it-works",
      "/faq",
      "/resources",
    ]) {
      await page.goto(route);
      await expect(
        page
          .getByRole("heading", {
            level: 1,
          })
          .first(),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${width} ${route}`,
      ).toBeTruthy();
    }
  }
  await page.goto("/");
  await expect(page.locator(".hc-hero h1")).toBeVisible();
  await expect(page.locator(".hc-service-card")).toHaveCount(12);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images).map(async (img) => {
        img.loading = "eager";
        await img.decode();
      }),
    );
  });
  await page.screenshot({
    path: "output/qa/healthcare-desktop.png",
    fullPage: true,
  });
  await page.getByLabel("Language / भाषा").first().selectOption("mr");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "output/qa/healthcare-marathi-mobile.png",
    fullPage: true,
  });
  await page.screenshot({
    path: "output/qa/healthcare-marathi-mobile-top.png",
    fullPage: false,
  });
  expect(errors).toEqual([]);
});

test("owner can save service changes and publish an uploaded multilingual FAQ", async ({
  page,
}) => {
  test.setTimeout(120000);
  const users = JSON.parse(await readFile(".runtime/e2e-users.json", "utf8"));
  await page.goto("/");
  await page.request.post("/api/v1/auth/login", { data: users.owner });
  await page.goto("/portal");
  await page.getByRole("button", { name: "Services", exact: true }).click();
  await page
    .getByRole("button", { name: "Edit service", exact: true })
    .first()
    .click();
  const serviceDialog = page.getByRole("dialog");
  await serviceDialog
    .getByLabel("SEO title", { exact: true })
    .fill("Home nursing in Pune");
  await serviceDialog
    .getByRole("button", { name: "Save service", exact: true })
    .click();
  await expect(serviceDialog).toHaveCount(0);
  await page.getByRole("button", { name: "Content", exact: true }).click();
  await page.getByRole("button", { name: "Add content", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .locator("summary")
    .filter({ hasText: "Upload a marketing photograph" })
    .click();
  await dialog
    .getByLabel("Image file")
    .setInputFiles("public/images/healthcare/elderly-care.webp");
  for (const lang of ["en", "hi", "mr"])
    await dialog
      .getByLabel(`Image description (${lang})`, { exact: true })
      .fill(
        lang === "en"
          ? "Illustrative caregiver"
          : lang === "hi"
            ? "देखभाल का उदाहरणात्मक चित्र"
            : "देखभालीचे प्रातिनिधिक चित्र",
      );
  await dialog.getByLabel("AI-generated / illustrative image").check();
  await dialog
    .getByLabel(
      "I have the rights and any necessary written consent to publish this image.",
    )
    .check();
  await dialog
    .getByRole("button", { name: "Upload image", exact: true })
    .click();
  await expect(dialog.getByLabel("Uploaded image ID")).not.toHaveValue("");
  await dialog.getByLabel("Content type", { exact: true }).selectOption("faq");
  await dialog
    .getByLabel("URL slug", { exact: true })
    .fill("fictional-browser-faq");
  for (const [language, title, body] of [
    [
      "English",
      "Fictional browser FAQ",
      "Fictional content for an isolated browser test.",
    ],
    ["हिन्दी", "ब्राउज़र परीक्षण प्रश्न", "यह केवल अलग परीक्षण की सामग्री है।"],
    [
      "मराठी",
      "ब्राउझर चाचणी प्रश्न",
      "हा केवळ स्वतंत्र चाचणीसाठीचा मजकूर आहे.",
    ],
  ]) {
    const group = dialog.getByRole("group", { name: language, exact: true });
    await group.getByLabel("Title", { exact: true }).fill(title);
    await group.getByLabel("Body", { exact: true }).fill(body);
  }
  await dialog.getByLabel("I verified this content.", { exact: false }).check();
  await dialog.getByLabel("Publish on the website").check();
  const createdPromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/admin/content") &&
      response.request().method() === "POST",
  );
  await dialog
    .getByRole("button", { name: "Save content", exact: true })
    .click();
  const created = await (await createdPromise).json();
  await expect(dialog).toHaveCount(0);
  try {
    await page.goto("/faq");
    await page.getByLabel("Language / भाषा").first().selectOption("mr");
    await expect(
      page.getByRole("heading", { name: "ब्राउझर चाचणी प्रश्न", exact: true }),
    ).toBeVisible();
  } finally {
    const { data: rows } = await (
      await page.request.get("/api/v1/admin/content")
    ).json();
    const row = rows.find((r: any) => r._id === created.data._id);
    await page.request.patch(`/api/v1/admin/content/${row._id}`, {
      data: {
        kind: row.kind,
        slug: row.slug,
        title: row.title,
        body: row.body,
        imageId: row.imageId,
        published: false,
        approved: row.approved,
        externalUrl: row.externalUrl || "",
        sortOrder: row.sortOrder,
      },
    });
  }
});
