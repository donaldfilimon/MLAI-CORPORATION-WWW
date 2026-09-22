import { describe, it, expect } from "vitest";
import { content } from "../data";
import { ContentSchema } from "../data/schemas";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe("content data layer", () => {
  it("validates against ContentSchema (no malformed entries)", () => {
    expect(() => ContentSchema.parse(content)).not.toThrow();
  });

  it("has every top-level category populated", () => {
    expect(content.about.values.length).toBeGreaterThan(0);
    expect(content.platform.length).toBeGreaterThan(0);
    expect(content.industries.length).toBeGreaterThan(0);
    expect(content.services.length).toBeGreaterThan(0);
    expect(content.research.publications.length).toBeGreaterThan(0);
    expect(content.blog.length).toBeGreaterThan(0);
    expect(content.team.length).toBeGreaterThan(0);
    expect(content.stats.length).toBeGreaterThan(0);
    expect(content.faq.length).toBeGreaterThan(0);
  });
});

describe("blog posts", () => {
  it("every post has a unique, URL-safe slug", () => {
    const slugs = content.blog.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(SLUG_RE);
  });

  it("every post has an excerpt and a non-empty body so its detail page renders", () => {
    for (const post of content.blog) {
      expect(post.excerpt.length).toBeGreaterThan(0);
      expect(post.body.length).toBeGreaterThan(0);
      for (const section of post.body) {
        expect(section.paragraphs.length + (section.list?.length ?? 0)).toBeGreaterThan(0);
      }
    }
  });
});

describe("research publications", () => {
  it("every paper has a unique, URL-safe slug", () => {
    const slugs = content.research.publications.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(SLUG_RE);
  });

  it("every paper has an abstract and a non-empty body", () => {
    for (const paper of content.research.publications) {
      expect(paper.abstract.length).toBeGreaterThan(0);
      expect(paper.body.length).toBeGreaterThan(0);
    }
  });
});

describe("team / founder profile", () => {
  it("exposes the founder profile with the fields the page needs", () => {
    const donald = content.team.find((m) => m.slug === "donald-filimon");
    expect(donald).toBeDefined();
    expect(donald?.socials?.github).toBeTruthy();
    expect((donald?.focusAreas ?? []).length).toBeGreaterThan(0);
    expect((donald?.projects ?? []).length).toBeGreaterThan(0);
    expect((donald?.body ?? []).length).toBeGreaterThan(0);
  });

  it("every member with a slug uses a URL-safe slug", () => {
    for (const member of content.team) {
      if (member.slug) expect(member.slug).toMatch(SLUG_RE);
    }
  });
});
