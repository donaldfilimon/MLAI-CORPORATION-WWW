import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { resolve, join, extname, sep } from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

// Use an explicitly supplied existing Playwright installation; do not install a second UI stack.
assert.ok(
  process.env.MLAI_PLAYWRIGHT_ROOT,
  "Set MLAI_PLAYWRIGHT_ROOT to an installed Playwright project",
);
const { chromium, firefox, webkit, expect } = createRequire(
  join(resolve(process.env.MLAI_PLAYWRIGHT_ROOT), "package.json"),
)("@playwright/test");
const root = resolve("out"),
  output = resolve("verification");
await mkdir(output, { recursive: true });
const manifestBytes = await readFile(join(root, "research-manifest.json"));
const manifest = JSON.parse(manifestBytes);
const studies = JSON.parse(
  await readFile(join(root, "implementation-data.json"), "utf8"),
);
const research = JSON.parse(
  await readFile(join(root, "research-data.json"), "utf8"),
);
const server = createServer(async (req, res) => {
  try {
    const path = resolve(
      root,
      "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
    );
    assert.ok(path === root || path.startsWith(root + sep));
    const file = (await stat(path)).isDirectory()
      ? join(path, "index.html")
      : path;
    res.setHeader(
      "Content-Type",
      {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".pdf": "application/pdf",
      }[extname(file)] || "application/octet-stream",
    );
    res.end(await readFile(file));
  } catch {
    res.statusCode = 404;
    res.end("Not found");
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
const results = [];
try {
  for (const [engine, browserType] of Object.entries({
    chromium,
    firefox,
    webkit,
  })) {
    const browser = await browserType.launch();
    try {
      for (const width of [390, 768, 1440]) {
        const page = await browser.newPage({
          viewport: { width, height: 900 },
          reducedMotion: "reduce",
        });
        const errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("response", (response) => {
          if (response.url().startsWith(base) && response.status() >= 400)
            errors.push(
              `HTTP ${response.status()}: ${new URL(response.url()).pathname}`,
            );
        });
        await page.goto(base + "/research?source=bookmark#main");
        const search = page.getByRole("searchbox", { name: "Search research" });
        const cards = page.locator("[data-research-item]:visible");
        await expect(cards).toHaveCount(28);
        await search.fill("six-layer");
        await expect(cards).toHaveCount(1);
        await expect(cards.first()).toContainText("Reference snapshot");
        await expect(cards.first().locator("time")).toHaveCount(0);
        for (const topic of studies[0].relatedTopics) {
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
        assert.equal(
          new URL(page.url()).searchParams.get("source"),
          "bookmark",
        );
        assert.equal(new URL(page.url()).hash, "#main");
        await page.locator("#reset-filters").focus();
        await page.keyboard.press("Enter");
        await expect(search).toBeFocused();
        await expect(search).toHaveValue("six-layer");
        await page.locator("#clear-search").click();
        await expect(cards).toHaveCount(28);
        await page.goBack();
        await expect(search).toHaveValue("six-layer");
        await page.goto(
          base +
            "/research?source=bookmark&q=missing&type=unknown&topic=unknown#main",
        );
        await expect(cards).toHaveCount(0);
        await expect(page.getByRole("status")).toHaveText(
          "No research matches your search and filters.",
        );
        await page.locator("#clear-all").focus();
        await page.keyboard.press("Enter");
        await expect(search).toBeFocused();
        await expect(cards).toHaveCount(28);
        assert.equal(new URL(page.url()).search, "?source=bookmark");
        await page.goto(base + "/research?tag=unknown");
        await expect(cards).toHaveCount(0);
        await expect(page.locator("#legacy-tag-filter")).toContainText(
          "unknown",
        );
        await page.locator("#reset-filters").click();
        await expect(cards).toHaveCount(28);
        await page.goto(base + "/research");
        await expect(search).toBeInViewport({ ratio: 1 });
        await page.screenshot({
          path: join(output, `site-${engine}-${width}.png`),
        });
        await search.fill("x".repeat(500));
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        );
        await page.goto(base + "/research/implementations/" + studies[0].slug);
        const disclosure = page.locator(".preview-mobile-contents");
        if (await disclosure.isVisible()) {
          await disclosure.locator("summary").focus();
          await page.keyboard.press("Enter");
        }
        const anchor = page.locator(
          '.preview-contents:visible a[href="#section-2"]',
        );
        await anchor.focus();
        await page.keyboard.press("Enter");
        await expect(page.locator("#section-2")).toBeInViewport();
        await page.goto(
          base + "/research/wdbx-weighted-backtrace-memory-store",
        );
        await expect(page.locator(".katex").first()).toBeVisible();
        await page.locator(".preview-math").first().focus();
        await expect(page.locator(".preview-math").first()).toBeFocused();
        await page.keyboard.press("ArrowRight");
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        );
        await page.screenshot({
          path: join(output, `article-${engine}-${width}.png`),
        });
        assert.deepEqual(errors, []);
        results.push({ engine, width, status: "passed" });
        await page.close();
      }
      const noJS = await browser.newPage({ javaScriptEnabled: false });
      await noJS.goto(base + "/research");
      await expect(noJS.locator("[data-research-item]")).toHaveCount(28);
      await noJS.close();
    } finally {
      await browser.close();
    }
  }
  for (const p of research.publications)
    for (const attachment of p.attachments) {
      const response = await fetch(base + attachment.url);
      assert.equal(response.status, 200);
      assert.equal(
        createHash("sha256")
          .update(Buffer.from(await response.arrayBuffer()))
          .digest("hex"),
        attachment.sha256,
      );
    }
  await writeFile(
    join(output, "browser.json"),
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        sourceRevision: manifest.sourceRevision,
        harnessSha256: createHash("sha256")
          .update(await readFile(new URL(import.meta.url)))
          .digest("hex"),
        manifestSha256: createHash("sha256")
          .update(manifestBytes)
          .digest("hex"),
        results,
        noJavascript: "28 accessible links in all engines",
        attachments: "four PDF hashes passed",
        actualZoom: "separate manual gate",
        voiceOver: "separate manual gate",
        published: false,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(JSON.stringify(results));
} finally {
  await new Promise((r) => server.close(r));
}
