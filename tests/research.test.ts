import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import data from "@/content/research-data.json";
import {
  publications,
  researchTracks,
  researchItems,
  publicationPaths,
  researchGuideLinks,
} from "@/content/research";
import { pages, researchPaths } from "@/content/pages";
import { ResearchArticle } from "@/components/research-pages";
import sitemap from "@/app/sitemap";
import {
  generateStaticParams,
  generateMetadata,
} from "@/app/(public)/[...slug]/page";

const hash = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");
const manifest = JSON.parse(
  readFileSync("docs/research-merge/source-manifest.json", "utf8"),
);

describe("consolidated research collection", () => {
  it("preserves the complete source-reviewed snapshot and all attachment bytes", () => {
    expect(hash(JSON.stringify(data))).toBe(manifest.contentSha256);
    expect(publications).toHaveLength(manifest.publications.length);
    for (const p of publications) {
      expect(hash(JSON.stringify(p))).toBe(
        manifest.publications.find(
          (item: { slug: string }) => item.slug === p.slug,
        ).contentSha256,
      );
      for (const attachment of p.attachments) {
        expect(attachment.url).toMatch(/^\/research\/[a-z0-9-]+\.pdf$/);
        const bytes = readFileSync(join("public", attachment.url));
        expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
        expect(hash(bytes)).toBe(attachment.sha256);
      }
    }
  });
  it("resolves every track, legacy note, guide link, route and sitemap entry", () => {
    const paths = [...Object.keys(pages), ...publicationPaths];
    expect(new Set(paths).size).toBe(paths.length);
    const generated = generateStaticParams().map(({ slug }) => slug.join("/"));
    const mapped = sitemap().map((item) => new URL(item.url).pathname);
    for (const path of [...publicationPaths, ...researchPaths]) {
      expect(generated).toContain(path);
      expect(mapped).toContain(`/${path}`);
      expect(researchItems.some((item) => item.href === `/${path}`)).toBe(true);
    }
    for (const track of researchTracks)
      expect(publicationPaths).toContain(`research/${track.overviewSlug}`);
    for (const guide of Object.values(researchGuideLinks))
      expect(pages[guide.href.slice(1)]).toBeDefined();
  });
  it("retains bounded status, pinned evidence, dates and discoverable metadata for every publication", async () => {
    for (const p of publications) {
      expect(["Implemented", "Experimental", "Proposed"]).toContain(p.status);
      expect(p.statusNote.length).toBeGreaterThan(20);
      expect(p.limitations.length).toBeGreaterThan(0);
      expect(p.sources.length).toBeGreaterThan(0);
      expect(p.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const source of p.sources) {
        const url = new URL(source.url);
        expect(url.protocol).toBe("https:");
        expect(source.revision).toMatch(/^[a-f0-9]{40}$/);
        expect(url.pathname).toContain(`/${source.revision}/`);
      }
      const meta = await generateMetadata({
        params: Promise.resolve({ slug: ["research", p.slug] }),
      });
      expect(meta.title).toBe(p.title);
      expect(meta.description).toBe(p.abstract);
    }
  });
  it("renders all article structures, equations, editions and citations without losing content", () => {
    for (const p of publications) {
      const html = renderToStaticMarkup(
        createElement(ResearchArticle, { publication: p }),
      );
      expect(html).toContain('id="evidence"');
      expect(html).toContain('id="sources"');
      for (const source of p.sources)
        expect(html).toContain(source.url.replaceAll("&", "&amp;"));
      for (const a of p.attachments) expect(html).toContain(a.sha256);
      if (p.body.some((s) => s.math?.length)) {
        expect(html).toContain("katex-mathml");
        expect(html).not.toContain("katex-error");
      }
      expect(html).toContain("Open the Abbey workspace");
    }
  });
});
