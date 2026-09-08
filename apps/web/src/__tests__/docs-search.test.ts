import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { searchDocuments, type SearchRecord } from "../lib/docs-search";
import { buildDocsSearchIndex } from "../lib/docs-index";
import { docNav } from "../data/categories/docs-nav";
import { docs } from "@/data/categories/docs";

const sample: SearchRecord[] = [
  {
    slug: "a",
    title: "ABI Runtime",
    description: "Local orchestration guide",
    group: "Start",
    body: "cargo check MCP server",
    href: "/docs#runtime",
  },
  {
    slug: "b",
    title: "WDBX Retrieval",
    description: "Nearest neighbor memory",
    group: "Architecture",
    body: "HNSW vector cosine",
    href: "/docs#wdbx",
  },
  {
    slug: "c",
    title: "Security & trust",
    description: "AuthKit sessions",
    body: "WorkOS rate limit",
    href: "/docs#trust",
  },
];

describe("searchDocuments (review local search)", () => {
  it("normalizes mixed case and whitespace", () => {
    const hits = searchDocuments("  AbI   runTIME ", sample);
    expect(hits.map((h) => h.slug)).toEqual(["a"]);
  });

  it("requires every query token and prefers title matches", () => {
    const hits = searchDocuments("wdbx hnsw", sample);
    expect(hits[0]?.slug).toBe("b");
    expect(searchDocuments("wdbx missingtoken", sample)).toEqual([]);
  });

  it("returns a deterministic prefix for an empty query without mutating input", () => {
    const copy = sample.map((s) => ({ ...s }));
    const hits = searchDocuments("   ", sample);
    expect(hits).toHaveLength(3);
    expect(sample).toEqual(copy);
  });

  it("treats markup-like terms as plain text", () => {
    expect(searchDocuments("<script>", sample)).toEqual([]);
    expect(searchDocuments("abi.*", sample)).toEqual([]);
  });
});

describe("docs search index grounding", () => {
  it("indexes every docs-nav section and keeps research hrefs on canonical routes", () => {
    const index = buildDocsSearchIndex();
    for (const group of docNav) {
      for (const item of group.items) {
        const hit = index.find((r) => r.slug === `docs:${item.id}`);
        expect(hit?.href).toBe(`/docs#${item.id}`);
        expect(hit?.title).toBe(item.label);
      }
    }
    const researchHits = index.filter((r) => r.slug.startsWith("research:"));
    expect(researchHits.length).toBeGreaterThan(0);
    for (const hit of researchHits) {
      expect(hit.href).toMatch(/^\/research\/[a-z0-9-]+$/);
    }
  });

  it("keeps docs-nav section ids present in the Docs view", () => {
    const docsView = readFileSync(
      resolve(__dirname, "../views/Docs.tsx"),
      "utf8",
    );
    for (const group of docNav) {
      for (const item of group.items) {
        expect(docsView).toContain(`id="${item.id}"`);
      }
    }
  });
});

describe("ported docs in the search index", () => {
  it("indexes every ported doc with a path href", () => {
    const index = buildDocsSearchIndex();
    for (const doc of docs) {
      const record = index.find((r) => r.href === `/docs/${doc.slug}`);
      expect(record, doc.slug).toBeTruthy();
      expect(record!.title).toBe(doc.title);
    }
  });

  it("still indexes every existing docs-nav section as a hash href", () => {
    const index = buildDocsSearchIndex();
    const expectedCount = docNav.reduce(
      (total, group) => total + group.items.length,
      0,
    );
    const hashRecords = index.filter((r) => r.href.startsWith("/docs#"));
    expect(hashRecords).toHaveLength(expectedCount);
  });

  it("keeps every indexed slug unique across docs-nav, research, and ported sources", () => {
    const index = buildDocsSearchIndex();
    const slugs = index.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
