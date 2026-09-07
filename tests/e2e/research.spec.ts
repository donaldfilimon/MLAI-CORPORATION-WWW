import { test, expect } from "@playwright/test";
import { publications } from "../../src/content/research";

for (const width of [390, 768, 1440]) {
  test(`merged research library and evidence at ${width}px`, async ({
    page,
    request,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/research?source=bookmark#main");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Research you can follow to the source.",
    );
    const cards = page.locator(".article-index > a");
    await expect(cards).toHaveCount(24);
    await page
      .getByRole("combobox", { name: "Research area" })
      .selectOption("mcp");
    await page
      .getByRole("combobox", { name: "Document type" })
      .selectOption("implementation-guide");
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText("MCP");
    await page.reload();
    await expect(cards).toHaveCount(1);
    await cards.first().click();
    await expect(page).toHaveURL(/research\/mcp-implementation-guide/);
    await expect(page.locator("#sources a").first()).toHaveAttribute(
      "href",
      /^https:\/\/github.com\/donaldfilimon\/abi\/blob\/[a-f0-9]{40}\//,
    );
    await page.goBack();
    await expect(
      page.getByRole("combobox", { name: "Research area" }),
    ).toHaveValue("mcp");
    await page.getByRole("button", { name: "Reset filters" }).click();
    await expect(cards).toHaveCount(24);
    expect(new URL(page.url()).searchParams.get("source")).toBe("bookmark");
    expect(new URL(page.url()).hash).toBe("#main");
    const search = page.getByRole("searchbox", { name: "Search research" });
    await search.fill("no-such-publication-zz");
    await expect(cards).toHaveCount(0);
    await page.getByRole("button", { name: "Clear search" }).focus();
    await page.keyboard.press("Enter");
    await expect(search).toBeFocused();
    await expect(cards).toHaveCount(24);
    const article = publications.find(
      (p) => p.slug === "wdbx-weighted-backtrace-memory-store",
    )!;
    await page.goto(`/research/${article.slug}`);
    const evidence = page.locator("#evidence");
    // The section heading renders "Evidence & limitations" with a lowercase
    // l, so assert the rendered heading and then the data it is claiming to
    // show, rather than a capitalised substring that never appears.
    await expect(evidence.getByRole("heading", { level: 2 })).toHaveText(
      "Evidence & limitations",
    );
    await expect(evidence).toContainText(article.statusNote);
    for (const limitation of article.limitations) {
      await expect(evidence).toContainText(limitation);
    }
    await expect(page.locator(".katex").first()).toBeVisible();
    await expect(page.locator("#downloads")).toContainText(
      "Historical edition · superseded",
    );
    await expect(page.locator("#downloads a")).toHaveCount(2);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    if (process.env.MLAI_RESEARCH_SCREENSHOTS) {
      await page.screenshot({
        path: `${process.env.MLAI_RESEARCH_SCREENSHOTS}/research-article-${width}.png`,
        fullPage: true,
      });
      await page.goto("/research");
      await page.screenshot({
        path: `${process.env.MLAI_RESEARCH_SCREENSHOTS}/research-library-${width}.png`,
        fullPage: true,
      });
    }
    for (const a of publications.flatMap((p) => p.attachments)) {
      const response = await request.get(a.url);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("application/pdf");
    }
    expect(errors).toEqual([]);
  });
}

test("every research route is served and unknown research returns 404", async ({
  request,
}) => {
  for (const p of publications) {
    const response = await request.get(`/research/${p.slug}`);
    expect(response.status(), p.slug).toBe(200);
    expect(await response.text()).toContain('id="sources"');
  }
  for (const path of [
    "provenance",
    "provider-boundaries",
    "execution-traces",
  ]) {
    expect((await request.get(`/research/${path}`)).status()).toBe(200);
  }
  expect((await request.get("/research/missing-publication")).status()).toBe(
    404,
  );
});
