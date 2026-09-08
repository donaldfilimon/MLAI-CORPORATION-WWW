import { test, expect } from "@playwright/test";
import { join } from "node:path";

test("documentation search survives navigation and offers accessible recovery", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/docs?q=API&source=bookmark#main");
  // "Filter documentation" is the in-page index filter; the docs shell's ⌘K
  // palette separately owns the "Search documentation…" name. Keep them distinct.
  const search = page.getByRole("searchbox", { name: "Filter documentation" });
  await expect(search).toHaveValue("API");
  const cards = page.locator(".article-index > a");
  const firstTitle = await cards.first().locator("h2").innerText();
  const articlePath = await cards.first().getAttribute("href");
  await cards.first().click();
  await expect(page).toHaveURL(new URL(articlePath!, page.url()).href);
  await page.goBack();
  await expect(search).toHaveValue("API");
  await expect(cards.first().locator("h2")).toHaveText(firstTitle);
  await page.goForward();
  await expect(page).toHaveURL(new URL(articlePath!, page.url()).href);
  await page.goBack();
  await expect(search).toHaveValue("API");
  await search.fill("  API   reference  ");
  await expect(cards).toHaveCount(1);
  await expect(page.getByRole("status")).toHaveText("1 article found");
  await page.reload();
  await expect(search).toHaveValue("  API   reference  ");
  await expect(cards).toHaveCount(1);
  await search.fill("no-matching-article-xyz");
  await expect(cards).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("0 articles found");
  await expect(
    page.getByText("Try fewer words or clear your search."),
  ).toBeVisible();
  const clear = page.getByRole("button", { name: "Clear search" });
  await clear.focus();
  await page.keyboard.press("Enter");
  await expect(search).toBeFocused();
  await expect(search).toHaveValue("");
  expect(new URL(page.url()).searchParams.has("q")).toBe(false);
  expect(new URL(page.url()).searchParams.get("source")).toBe("bookmark");
  expect(new URL(page.url()).hash).toBe("#main");
  expect(await cards.count()).toBeGreaterThan(1);
  await search.fill("   ");
  expect(await cards.count()).toBeGreaterThan(1);
  await search.fill("");
  await search.pressSequentially("reference API");
  await expect(search).toHaveValue("reference API");
  await expect(cards).toHaveCount(1);
  await expect(page).toHaveURL(/q=reference\+API/);
  expect(errors).toEqual([]);
});

test("research search is correctly labelled and fits supported viewports", async ({
  page,
}) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/research?q=provenance");
    await expect(page).toHaveTitle(/Research/);
    await expect(
      page.getByRole("searchbox", { name: "Search research" }),
    ).toHaveValue("provenance");
    await expect(page.locator(".article-index > a").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Clear search" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    if (process.env.MLAI_SEARCH_SCREENSHOTS) {
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: join(
          process.env.MLAI_SEARCH_SCREENSHOTS,
          `research-search-${width}.png`,
        ),
        fullPage: true,
        animations: "disabled",
      });
    }
    await page.getByRole("searchbox").fill("x".repeat(300));
    await expect(
      page.getByText(
        "Try another research area, document type, or search term.",
      ),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
});
