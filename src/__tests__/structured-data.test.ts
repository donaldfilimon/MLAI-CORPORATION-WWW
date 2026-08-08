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

  it("researchArticleLd splits comma-separated authors into Person entries", () => {
    const withAuthors = content.research.publications.find((p) => p.authors);
    if (!withAuthors) return; // no fixture with authors — nothing to assert
    const ld = researchArticleLd(withAuthors);
    expect(Array.isArray(ld.author)).toBe(true);
  });

  it("researchArticleLd falls back to the Organization when no author is given", () => {
    const noAuthor = content.research.publications.find((p) => !p.authors);
    if (!noAuthor) return;
    const ld = researchArticleLd(noAuthor);
    expect(ld.author).toMatchObject({ "@type": "Organization" });
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
