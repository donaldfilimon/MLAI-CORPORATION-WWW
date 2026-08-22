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

  it("keeps the duplicated brand assets byte-identical to public/", () => {
    // Existence alone is not enough. `bun run og` regenerates the raster brand
    // assets into `public/` ONLY — it has no `site/` step — so after a re-skin
    // the published landing page silently keeps the old artwork while every
    // existence assertion above still passes. Compare the bytes.
    for (const asset of ["favicon.svg", "og-image.png", "apple-touch-icon.png"]) {
      const inSite = readFileSync(resolve(SITE_DIR, asset));
      const inPublic = readFileSync(resolve(SITE_DIR, "..", "public", asset));
      expect(
        inSite.equals(inPublic),
        `site/${asset} has drifted from public/${asset} — re-copy it after \`bun run og\``,
      ).toBe(true);
    }
  });

  it("uses relative asset paths, which are the only ones Pages can serve", () => {
    // Pages serves this repo under the /MLAI-CORPORATION-WWW/ project prefix,
    // so a root-absolute "/favicon.svg" resolves to the user-pages root and
    // leaves the uploaded artifact entirely (it 404s, or worse, silently
    // returns a different repo's file). The existing `/_next/` and `/public/`
    // greps do not catch this shape.
    const rootAbsolute = html.match(/(?:href|src)="\/(?!\/)[^"]*"/g) ?? [];
    expect(rootAbsolute, `root-absolute asset paths cannot resolve under the Pages project prefix`).toEqual([]);
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

describe("pages.yml — the workflow's paths filter must cover this test's inputs", () => {
  // Why this guard exists. The filter only listed `site/**`, the test file, and
  // the workflow — but this test ALSO imports SITE_URL from route-meta.ts and
  // byte-compares site/<asset> against public/<asset>. So the two inputs most
  // likely to change (a re-skin, a canonical-host edit) triggered nothing.
  //
  // The concrete failure: `bun run og` writes the raster brand assets into
  // public/ ONLY — it has no site/ step. After a re-skin, site/ silently keeps
  // the old artwork, Pages keeps publishing it, and the drift only surfaces
  // later as a confusing red build on the next unrelated site/ commit.
  //
  // Deriving the dependency list from this file's own source, rather than
  // hardcoding it, is the point: add an import or a compared asset without
  // widening the filter and this fails instead of going quiet.
  const workflow = readFileSync(
    resolve(__dirname, "../../.github/workflows/pages.yml"),
    "utf8",
  );
  const selfSource = readFileSync(resolve(__dirname, "landing-page.test.ts"), "utf8");

  // Narrow on purpose: only the `paths:` block of the push trigger, stopping at
  // `workflow_dispatch`. A full YAML parse would need a dependency the repo
  // does not carry, and this block is a flat list of quoted strings.
  const pathsBlock = workflow.split("workflow_dispatch")[0] ?? "";
  const filter = [...pathsBlock.matchAll(/^\s+- "([^"]+)"/gm)].map((m) => m[1] as string);

  const covers = (file: string) =>
    filter.some((p) => (p.endsWith("/**") ? file.startsWith(p.slice(0, -3) + "/") : p === file));

  it("parses a non-empty paths filter (guards against the regex silently matching nothing)", () => {
    // Deliberately NOT a minimum count. An earlier draft asserted `> 3` and so
    // failed when the filter was narrowed — which looks right but is the wrong
    // reason: this case exists only to catch the regex above silently matching
    // nothing, which would make the two real assertions below vacuously pass.
    // Coverage is their job; this one just proves the parse worked.
    expect(filter.length).toBeGreaterThan(0);
    expect(filter).toContain("site/**");
  });

  it("covers every @/lib module this test imports", () => {
    const imported = [...selfSource.matchAll(/from "@\/lib\/([a-z-]+)"/g)].map(
      (m) => `src/lib/${m[1]}.ts`,
    );
    expect(imported.length).toBeGreaterThan(0);
    for (const dep of imported) {
      expect(covers(dep), `${dep} is read by this test but no pages.yml path matches it`).toBe(
        true,
      );
    }
  });

  it("covers every public/ asset this test byte-compares", () => {
    const assets = [
      ...new Set(
        [...selfSource.matchAll(/"(favicon\.svg|og-image\.png|apple-touch-icon\.png)"/g)].map(
          (m) => m[1] as string,
        ),
      ),
    ];
    expect(assets.length).toBe(3);
    for (const a of assets) {
      expect(
        covers(`public/${a}`),
        `public/${a} is byte-compared here but no pages.yml path matches it`,
      ).toBe(true);
    }
  });
});
