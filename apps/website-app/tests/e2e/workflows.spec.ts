import { test, expect } from "@playwright/test";
const email = `browser-${Date.now()}@example.test`,
  password = "Local-test-password!2026";
test("public pages, account onboarding, projects, document sources, and responsive shell", async ({
  page,
}, testInfo) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (response) => {
    if (response.status() >= 500)
      errors.push(`${response.status()} ${new URL(response.url()).pathname}`);
  });
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "AI infrastructure that never phones home.",
    }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath(`home-1440.png`),
    fullPage: true,
    animations: "disabled",
  });
  for (const path of [
    "/architecture",
    "/platform",
    "/abi",
    "/wdbx",
    "/abbey",
    "/research",
    "/docs",
    "/docs/api",
    "/services",
    "/company",
    "/investors",
    "/privacy",
    "/terms",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.locator("h1").innerText()).not.toContain("404");
  }
  await page.goto("/app");
  await expect(page).toHaveURL(/sign-in/);
  await page.goto("/sign-up");
  await page.getByLabel("Your name", { exact: true }).fill("Browser Reviewer");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/app$/, { timeout: 30000 });
  await expect(
    page.getByRole("heading", { name: /workspace/i }).first(),
  ).toBeVisible();
  await page.goto("/app/projects");
  await page.getByLabel("Project name").fill("Source review");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(page.getByText("Source review", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Source review", { exact: true })).toBeVisible();
  await page.goto("/app/documents");
  await page.getByLabel("Upload documents", { exact: true }).setInputFiles({
    name: "review.md",
    mimeType: "text/markdown",
    buffer: Buffer.from(
      "# MLAI project review\n\nThe project owner is Morgan. The architecture review is due Friday. Abbey keeps source references.",
    ),
  });
  await expect(
    page.getByText("review.md", { exact: true }).first(),
  ).toBeVisible({ timeout: 30000 });
  await expect(page.locator(".document-paper")).toContainText("Morgan", {
    timeout: 90000,
  });
  await page.screenshot({
    path: testInfo.outputPath(`documents-1440.png`),
    fullPage: true,
    animations: "disabled",
  });
  await page.goto("/app/search");
  await page.getByRole("textbox").first().fill("Morgan");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByText("review.md", { exact: true })).toBeVisible({
    timeout: 30000,
  });
  await page.getByText("review.md", { exact: true }).click();
  await expect(page.locator(".focused-source")).toContainText("Morgan");
  await page.goto("/app/abbey");
  await expect(page.locator(".chat-layout")).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath(`abbey-1440.png`),
    fullPage: true,
    animations: "disabled",
  });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    for (const path of [
      "/",
      "/app",
      "/app/documents",
      "/app/console",
      "/app/portal",
      "/app/settings",
    ]) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      if (path.startsWith("/app"))
        await expect(page.locator(".app-shell")).toBeVisible();
      await expect(
        page.getByText("Too many requests. Try again shortly.", {
          exact: true,
        }),
      ).not.toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        `${path} at ${width}`,
      ).toBe(true);
    }
    await page.goto("/app/abbey");
    await expect(page.locator(".chat-layout")).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`abbey-${width}.png`),
      fullPage: true,
      animations: "disabled",
    });
  }
  expect(errors).toEqual([]);
});
