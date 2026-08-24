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

describe("pages.yml — every input this test reads must be able to trigger a republish", () => {
  // WHAT CHANGED, and why this block was rewritten rather than deleted.
  //
  // The invariant here has never changed: if this test reads an input, a change
  // to that input must be able to republish the page. What changed is the
  // mechanism that satisfies it.
  //
  // This block used to assert that pages.yml's `paths:` filter LISTED every
  // such input. That was the right guard for a `push:`-triggered workflow, and
  // it was added after a real incident: `bun run og` writes raster brand assets
  // into public/ only, so after a re-skin site/ silently kept the old artwork,
  // nothing matched the filter, and Pages published stale branding.
  //
  // pages.yml is now gated on CI via `workflow_run`, which mirrors
  // deploy-cloudrun.yml. `workflow_run` does not support `paths:` at all, so
  // the old assertion cannot be satisfied by any correct workflow — it would
  // fail forever. It is replaced, not dropped, because the underlying risk is
  // real and the new mechanism must be shown to address it.
  //
  // It addresses it MORE completely: with no filter, the publish is
  // unconditional on every CI-green push to main, so no input can be missed.
  // Every path filter is a guess at the complete input set, and that guess was
  // already wrong once. The assertions below therefore verify the opposite
  // property — that no filter is silently reintroduced, which would re-open
  // exactly the staleness this test was written to catch.
  const workflow = readFileSync(
    resolve(__dirname, "../../.github/workflows/pages.yml"),
    "utf8",
  );
  const selfSource = readFileSync(resolve(__dirname, "landing-page.test.ts"), "utf8");

  it("is gated on CI completing, not on a push paths filter", () => {
    expect(workflow).toContain("workflow_run:");
    expect(workflow).toContain('workflows: ["CI"]');
    // A `paths:` list under a push trigger would mean some inputs no longer
    // republish. Match the YAML key specifically so the word appearing in a
    // comment does not trip this.
    const pathsKey = /^\s*paths:\s*$/m.test(workflow);
    expect(
      pathsKey,
      "pages.yml reintroduced a paths filter; either restore per-input coverage assertions or remove the filter",
    ).toBe(false);
  });

  it("publishes the exact commit CI validated, not the branch head", () => {
    // Without this pin a workflow_run job checks out the default branch's
    // current HEAD, which may already have moved past the run that passed —
    // publishing a commit the gate never saw.
    expect(workflow).toContain("github.event.workflow_run.head_sha");
  });

  it("refuses to publish from a fork, a hole the push trigger did not have", () => {
    // THE trust boundary. This repo is public, so anyone can open a PR from a
    // fork, and a fork PR's `head_branch` can read "main" and pass the
    // `branches: [main]` filter. Without an identity check the job would run in
    // the base repo's context with `pages: write` and publish attacker-authored
    // site/ content on the real origin. Branch names are attacker-controlled;
    // repository identity is not.
    expect(workflow).toContain(
      "github.event.workflow_run.head_repository.full_name == github.repository",
    );
    expect(workflow).toContain("github.event.workflow_run.conclusion == 'success'");
    expect(workflow).toContain("github.event.workflow_run.event == 'push'");
  });

  it("still reads the inputs that motivated the original guard", () => {
    // Derived from this file's own source rather than hardcoded, keeping the
    // original design: if the test stops reading these, this notices. Their
    // coverage is now total by construction, but the inputs themselves are
    // still the reason the workflow must never regress to a filter.
    const imported = [...selfSource.matchAll(/from "@\/lib\/([a-z-]+)"/g)].map(
      (m) => `src/lib/${m[1]}.ts`,
    );
    expect(imported.length).toBeGreaterThan(0);

    const assets = [
      ...new Set(
        [...selfSource.matchAll(/"(favicon\.svg|og-image\.png|apple-touch-icon\.png)"/g)].map(
          (m) => m[1] as string,
        ),
      ),
    ];
    expect(assets.length).toBe(3);
  });
});
