import { test, expect } from "@playwright/test";
import {
  implementationStudies,
  publications,
} from "../../src/content/research";

for (const width of [390, 768, 1440]) {
  test(`complete discovery and filter recovery at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 720 });
    await page.goto("/research?source=bookmark#main");
    const search = page.getByRole("searchbox", { name: "Search research" });
    const cards = page.locator(".article-index > a");
    const study = implementationStudies.find(
      (item) => item.relatedTopics.length > 1,
    )!;
    await expect(search).toBeInViewport();
    await search.fill(study.title);
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText("Reference snapshot");
    await expect(cards.first().locator("time")).toHaveCount(0);
    for (const topic of study.relatedTopics) {
      await page
        .getByRole("combobox", { name: "Research area" })
        .selectOption(topic);
      await expect(cards).toHaveCount(1);
    }
    await page
      .getByRole("combobox", { name: "Document type" })
      .selectOption("implementation-study");
    await page.reload();
    await expect(cards).toHaveCount(1);
    await cards.first().click();
    await expect(page).toHaveURL(
      new RegExp(`/research/implementations/${study.slug}$`),
    );
    if (width <= 900)
      await page.locator("summary").filter({ hasText: "On this page" }).click();
    await page
      .getByRole("navigation", { name: "On this page", exact: true })
      .getByRole("link", { name: "Source evidence", exact: true })
      .click();
    await expect(page).toHaveURL(/#source-evidence$/);
    await expect(page.locator("#source-evidence")).toBeInViewport();
    await page.goto(
      "/research?source=bookmark&topic=unknown&type=unknown#main",
    );
    await expect(cards).toHaveCount(0);
    await expect(page.locator(".empty")).toContainText(
      "No research matches these filters.",
    );
    await expect(page.locator(".empty")).not.toContainText("“”");
    await page.getByRole("button", { name: "Clear all", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(search).toBeFocused();
    await expect(cards).toHaveCount(31);
    expect(new URL(page.url()).searchParams.toString()).toBe("source=bookmark");
    expect(new URL(page.url()).hash).toBe("#main");
    await page
      .getByRole("combobox", { name: "Research area" })
      .selectOption("ai");
    await search.fill("no-result-zz");
    await expect(cards).toHaveCount(0);
    await page.getByRole("button", { name: "Reset filters" }).click();
    await expect(search).toHaveValue("no-result-zz");
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(cards).toHaveCount(31);
    await expect(
      cards.filter({ has: page.locator("time") }).first(),
    ).toContainText("Source reviewed");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  });
  test(`merged research library and evidence at ${width}px`, async ({
    page,
    request,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/research?source=bookmark#main");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "MLAI Research",
    );
    await expect(page.locator("[data-research-area]")).toHaveCount(6);
    const studies = page.locator("[data-implementation-study]");
    await expect(studies).toHaveCount(7);
    await studies.first().click();
    await expect(page).toHaveURL(
      /research\/implementations\/six-layer-evidence-aware-platform/,
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "A six-layer architecture for evidence-aware AI systems",
    );
    await expect(page.locator("#operating-boundaries")).toBeVisible();
    await expect(page.locator("#source-evidence a")).toHaveCount(1);
    if (process.env.MLAI_RESEARCH_SCREENSHOTS) {
      await page.screenshot({
        path: `${process.env.MLAI_RESEARCH_SCREENSHOTS}/research-study-${width}.png`,
        fullPage: true,
      });
    }
    await page.goBack();
    const cards = page.locator(".article-index > a");
    await expect(cards).toHaveCount(31);
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
    await expect(cards).toHaveCount(31);
    expect(new URL(page.url()).searchParams.get("source")).toBe("bookmark");
    expect(new URL(page.url()).hash).toBe("#main");
    const search = page.getByRole("searchbox", { name: "Search research" });
    await search.fill("no-such-publication-zz");
    await expect(cards).toHaveCount(0);
    await page.getByRole("button", { name: "Clear search" }).focus();
    await page.keyboard.press("Enter");
    await expect(search).toBeFocused();
    await expect(cards).toHaveCount(31);
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
      await expect(
        page.getByRole("combobox", { name: "Research area" }),
      ).toBeVisible();
      await page.screenshot({
        path: `${process.env.MLAI_RESEARCH_SCREENSHOTS}/research-first-viewport-${width}.png`,
      });
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
  for (const study of implementationStudies) {
    const response = await request.get(
      `/research/implementations/${study.slug}`,
    );
    expect(response.status(), study.slug).toBe(200);
    const body = await response.text();
    expect(body).toContain('id="operating-boundaries"');
    expect(body).toContain('id="source-evidence"');
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
