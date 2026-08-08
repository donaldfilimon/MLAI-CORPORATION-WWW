import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { SITE_URL } from "@/lib/route-meta";

/**
 * `site/index.html` is a standalone, self-contained landing page published to
 * GitHub Pages by .github/workflows/pages.yml (which uploads ONLY the `site/`
 * directory — it cannot reference `public/`). Because it duplicates brand and
 * copy that also live in the Next app, it is the repo's most likely place for
 * silent drift. These assertions pin the invariants that actually matter:
 * the canonical/SEO relationship to the real host, the social card, and the
 * brand assets being physically present in the published directory.
 */

const SITE_DIR = resolve(__dirname, "../../site");
const html = readFileSync(resolve(SITE_DIR, "index.html"), "utf8");

describe("site/index.html — GitHub Pages landing page", () => {
  it("declares the real site as canonical (never competes with it for ranking)", () => {
    expect(html).toContain(`<link rel="canonical" href="${SITE_URL}/" />`);
  });

  it("ships a complete social card pointing at the canonical host", () => {
    for (const tag of [
      'property="og:title"',
      'property="og:description"',
      'property="og:image"',
      'property="og:url"',
      'name="twitter:card" content="summary_large_image"',
      'name="twitter:image"',
    ]) {
      expect(html).toContain(tag);
    }
    // Absolute, canonical-host image URLs — relative ones break every crawler.
    expect(html).toContain(`content="${SITE_URL}/og-image.png"`);
  });

  it("references brand assets that actually exist in the published directory", () => {
    for (const asset of ["favicon.svg", "og-image.png", "apple-touch-icon.png"]) {
      expect(existsSync(resolve(SITE_DIR, asset))).toBe(true);
      expect(html).toContain(asset);
    }
  });

  it("uses the brand fonts (Spectral display + Geist body), not a stale substitute", () => {
    expect(html).toContain("Spectral");
    expect(html).toMatch(/font-family:\s*"Geist"/);
  });

  it("uses the brand ink canvas and cyan primary", () => {
    expect(html).toContain("#05070d");
    expect(html.toLowerCase()).toContain("#22d3ee");
  });

  it("stays self-contained — no build-time asset paths that Pages cannot serve", () => {
    // The workflow uploads `site/` as the web root, so any /public/... or
    // /_next/... reference would 404 in production.
    expect(html).not.toContain("/_next/");
    expect(html).not.toContain('href="/public/');
    expect(html).not.toContain('src="/public/');
  });
});
