import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AbiPage } from "@/components/abi-page";
import { WdbxPage } from "@/components/wdbx-page";
import {
  BANNED_HANDOFF_FIGURES,
  figures,
  PROVENANCE,
} from "@/content/provenance";

/**
 * The claims gate.
 *
 * Public copy on this site describes four sibling repositories that this
 * repository cannot import. Nothing here can check that the claims are true —
 * only a human reading source can — so this file pins the specific claims that
 * were found false against source on 2026-09-07 and would be easy to restore
 * by copying an older design handoff back in.
 *
 * Verified against source that day:
 *   wdbx/crates/abi-wdbx/src/hnsw.rs   M = 16, EF_CONSTRUCTION = 40,
 *                                      EF_SEARCH = 32, MAX_LAYERS = 4
 *   wdbx/crates/abi-wdbx/src/format.rs prev_hash / SHA-256 chain exists
 *   abi/crates/abi-ai/src/router.rs    deterministic keyword-weighted routing
 *   abbey-bot/Cargo.toml               Rust: serenity 0.12, poise 0.6
 *   AbbeyBot/Package.swift             Swift 6.4: DiscordBM, Vapor, Fluent
 *   "backtrack" appears in none of abi, abbey, or wdbx
 *   no empathy or conciseness loss term exists in abi
 */

const roots = ["src/content", "src/components", "src/app"];

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const sources = roots
  .flatMap(walk)
  .filter((path) => /\.(ts|tsx)$/.test(path))
  .map((path) => ({ path, text: readFileSync(path, "utf8") }));

describe("provenance figures", () => {
  it("gives every published figure a source", () => {
    for (const figure of figures) {
      expect(figure.source.trim(), figure.id).not.toBe("");
    }
  });

  it("keeps every figure on one of the three tags", () => {
    for (const figure of figures) {
      expect(Object.keys(PROVENANCE), figure.id).toContain(figure.tag);
    }
  });

  it("cites a pinned commit, not a branch, for every source URL", () => {
    for (const figure of figures) {
      if (!figure.source.startsWith("https://")) continue;
      expect(figure.source, figure.id).toMatch(
        /github\.com\/[^/]+\/[^/]+\/blob\/[0-9a-f]{40}\//,
      );
    }
  });

  it("records the substrate defaults the Rust source currently defines", () => {
    const byId = new Map(figures.map((f) => [f.id, f]));
    expect(byId.get("hnsw-m")?.value).toBe("16");
    expect(byId.get("hnsw-ef-construction")?.value).toBe("40");
    expect(byId.get("hnsw-ef-search")?.value).toBe("32");
    expect(byId.get("hnsw-max-layers")?.value).toBe("4");
  });

  it("leaves unharnessed figures as targets with no number", () => {
    const latency = figures.find((f) => f.id === "query-latency");
    expect(latency?.tag).toBe("target");
    expect(latency?.value).toBe("—");
  });

  it("keeps the refusal list non-empty", () => {
    expect(BANNED_HANDOFF_FIGURES.length).toBeGreaterThan(0);
  });
});

describe("claims that were false against source", () => {
  it("does not restore the stale HNSW 200 defaults", () => {
    for (const source of sources) {
      expect(source.text, source.path).not.toMatch(
        /ef(?:_?construction)?\s*[=:]\s*["']?200\b/i,
      );
    }
  });

  it("does not describe Abbey Bot as a Bun or discord.js runtime", () => {
    for (const source of sources) {
      expect(source.text, source.path).not.toMatch(/discord\.js/i);
    }
  });

  it("does not claim a neural backtracking or rewind feature", () => {
    for (const source of sources) {
      expect(source.text, source.path).not.toMatch(/backtrack/i);
      expect(source.text, source.path).not.toMatch(
        /rewind(s|ing)?\s+to\s+the\s+exact/i,
      );
    }
  });

  it("does not claim empathy or conciseness loss terms", () => {
    for (const source of sources) {
      expect(source.text, source.path).not.toMatch(
        /(empathy|conciseness)\s+loss\s+term/i,
      );
    }
  });

  it("does not ship the banned handoff figures", () => {
    // provenance.ts names them in order to refuse them; that is the one file
    // where the strings are supposed to appear.
    const claimSources = sources.filter(
      ({ path }) => !path.endsWith("content/provenance.ts"),
    );
    expect(claimSources.length).toBeGreaterThan(0);
    for (const source of claimSources) {
      expect(source.text, source.path).not.toMatch(/295\s*[×x]\b/);
      expect(source.text, source.path).not.toMatch(/13\s*[×x]\s*neural/i);
      expect(source.text, source.path).not.toMatch(/0\.8\s*ms\b/i);
    }
  });

  it("names the real stack for each of the two Discord products", () => {
    const abbeyPage = sources.find(({ path }) =>
      path.endsWith("abbey-page.tsx"),
    )?.text;
    expect(abbeyPage).toBeDefined();
    expect(abbeyPage).toContain("serenity 0.12");
    expect(abbeyPage).toContain("poise 0.6");
    expect(abbeyPage).toContain("DiscordBM");
    expect(abbeyPage).toContain("Swift 6.4");
  });
});

describe("figures reach a page", () => {
  const markup =
    renderToStaticMarkup(createElement(WdbxPage)) +
    renderToStaticMarkup(createElement(AbiPage));

  it("renders every published figure, so none becomes dead data", () => {
    for (const figure of figures) {
      expect(markup, figure.id).toContain(figure.label);
      expect(markup, figure.id).toContain(figure.value);
    }
  });

  it("keeps each figure next to its own provenance chip", () => {
    for (const figure of figures) {
      expect(markup, figure.id).toContain(PROVENANCE[figure.tag].label);
    }
  });

  it("contains wide tables so narrow viewports do not scroll the page", () => {
    // .table-scroll is the shared-UI overflow container
    // (packages/ui/src/styles/components.css).
    expect(markup).toContain("table-scroll");
  });
});
