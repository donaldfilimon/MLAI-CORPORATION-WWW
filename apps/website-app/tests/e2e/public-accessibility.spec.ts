import { test, expect } from "@playwright/test";

test("shared navigation restores focus, respects reduced motion, and serves public routes", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    if (width === 390) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page
        .locator("#public-nav")
        .getByRole("link", { name: "Platform", exact: true })
        .focus();
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: "Open navigation" }),
      ).toBeFocused();
      await expect(
        page.getByRole("button", { name: "Open navigation" }),
      ).toHaveAttribute("aria-expanded", "false");
    }
    expect(
      await page
        .locator(".skip-link")
        .evaluate((element) => getComputedStyle(element).transitionDuration),
    ).toBe("0s");
    await page.screenshot({
      path: testInfo.outputPath(`home-${width}.png`),
      fullPage: true,
      animations: "disabled",
    });
  }
  await page.goto("/docs/");
  await expect(page.locator("h1")).toBeVisible();

  // The architecture page carries the widest content on the public site: two
  // parameter tables inside .table-scroll. Check the narrow viewport there
  // specifically, since a wide table that escapes its container scrolls the
  // whole page rather than just itself.
  await page.setViewportSize({ width: 390, height: 960 });
  await page.goto("/architecture/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  // Provenance chips must reach the reader, not just the markup.
  await expect(page.locator(".prov-tag").first()).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("architecture-390.png"),
    fullPage: true,
    animations: "disabled",
  });
  const missing = await page.goto("/not-a-real-release-route");
  expect(missing?.status()).toBe(404);
  expect(errors).toEqual([]);
});
