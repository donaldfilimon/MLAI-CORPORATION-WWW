import { describe, expect, it } from "vitest";
import {
  blogPostingLd,
  researchArticleLd,
  personLd,
  softwareApplicationLd,
} from "@/lib/structured-data";
import { content } from "@/data";
import { SITE_URL } from "@/lib/route-meta";

describe("structured-data", () => {
  it("blogPostingLd produces a valid, serializable BlogPosting", () => {
    const post = content.blog[0];
    if (!post) throw new Error("fixture: no blog post");
    const ld = blogPostingLd(post);
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.url).toBe(`${SITE_URL}/blog/${post.slug}`);
    expect(ld.headline).toBe(post.title);
    expect(() => JSON.stringify(ld)).not.toThrow();
  });

  // The previous version of this test only asserted `Array.isArray(ld.author)`,
  // which passed vacuously while the builder split on a separator no entry uses
  // and typed team names as `Person`. These assert the resolved names and type.
  it("researchArticleLd splits a real middle-dot byline into separate Organizations", () => {
    const paper = content.research.publications.find(
      (p) => p.slug === "wdbx-weighted-backtrace-memory-store",
    );
    if (!paper) throw new Error("fixture: wdbx-weighted-backtrace-memory-store is missing");
    expect(paper.authors).toBe("MLAI Research · WDBX Core");
    expect(researchArticleLd(paper).author).toEqual([
      { "@type": "Organization", name: "MLAI Research" },
      { "@type": "Organization", name: "WDBX Core" },
    ]);
  });

  it("researchArticleLd types every content-layer byline as an Organization, never a Person", () => {
    for (const paper of content.research.publications) {
      const authors = researchArticleLd(paper).author;
      for (const entry of Array.isArray(authors) ? authors : [authors]) {
        expect(entry["@type"]).toBe("Organization");
        expect(entry.name.length).toBeGreaterThan(0);
      }
    }
  });

  it("researchArticleLd still splits a comma-separated byline, trimming empties", () => {
    const base = content.research.publications[0];
    if (!base) throw new Error("fixture: no research publication");
    const ld = researchArticleLd({ ...base, authors: "MLAI Research, WDBX Core, " });
    expect(ld.author).toEqual([
      { "@type": "Organization", name: "MLAI Research" },
      { "@type": "Organization", name: "WDBX Core" },
    ]);
  });

  it("researchArticleLd falls back to the Organization when the byline is blank", () => {
    const base = content.research.publications[0];
    if (!base) throw new Error("fixture: no research publication");
    expect(researchArticleLd({ ...base, authors: "  ·  " }).author).toMatchObject({
      "@type": "Organization",
      name: "MLAI Corporation",
    });
  });

  it("blogPostingLd applies the same byline rule (team names are not People)", () => {
    const post = content.blog.find((p) => p.author?.includes("·"));
    if (!post) throw new Error("fixture: no blog post with a multi-unit byline");
    const expected = post.author!.split("·").map((name) => name.trim());
    expect(blogPostingLd(post).author).toEqual(
      expected.map((name) => ({ "@type": "Organization", name })),
    );
  });

  it("personLd includes sameAs links only for socials the member actually has", () => {
    const withGithub = content.team.find((m) => m.socials?.github);
    if (!withGithub) throw new Error("fixture: no team member with a github social");
    const ld = personLd(withGithub);
    expect(ld["@type"]).toBe("Person");
    expect(ld.sameAs).toContain(`https://github.com/${withGithub.socials!.github}`);
  });

  it("personLd omits @id/url for members without a dedicated profile slug", () => {
    const noSlug = content.team.find((m) => !m.slug);
    if (!noSlug) return; // every fixture member has a profile — nothing to assert
    const ld = personLd(noSlug);
    expect("url" in ld).toBe(false);
  });

  it("softwareApplicationLd produces a valid SoftwareApplication with no unstated pricing claim", () => {
    const product = content.products[0];
    if (!product) throw new Error("fixture: no product");
    const ld = softwareApplicationLd(product);
    expect(ld["@type"]).toBe("SoftwareApplication");
    expect(ld.url).toBe(`${SITE_URL}/products/${product.slug}`);
    expect(ld).not.toHaveProperty("offers");
  });
});
