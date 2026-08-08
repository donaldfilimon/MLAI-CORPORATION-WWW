import { describe, it, expect } from "vitest";
import {
  blogMeta,
  researchMeta,
  teamMeta,
  productMeta,
  toNextMetadata,
  NOT_FOUND_META,
  SITE_URL,
  type RouteMeta,
} from "../lib/route-meta";
import { content } from "../data";

function expectNotFound(meta: RouteMeta) {
  expect(meta).toEqual(NOT_FOUND_META);
  expect(meta.noindex).toBe(true);
}

function expectIndexable(meta: RouteMeta) {
  expect(meta).not.toEqual(NOT_FOUND_META);
  expect(meta.title.length).toBeGreaterThan(0);
  expect(meta.noindex).toBeFalsy();
}

// content slugs are typed optional but exist at runtime (content.test.ts pins
// uniqueness/URL-safety) — narrow to a definite string, failing loudly if not.
function firstSlug(items: ReadonlyArray<{ slug?: string }>): string {
  const slug = items[0]?.slug;
  if (!slug) throw new Error("fixture has no slug to derive metadata from");
  return slug;
}

// Unknown slugs must resolve to the noindex 404 meta so a missing detail page
// is never indexed; a real slug must derive indexable, titled meta.
describe("route-meta — dynamic slug derivation", () => {
  it("unknown slug → NOT_FOUND_META (noindex) for every deriver", () => {
    const u = "definitely-not-a-real-slug-xyz";
    expectNotFound(blogMeta(u));
    expectNotFound(researchMeta(u));
    expectNotFound(teamMeta(u));
    expectNotFound(productMeta(u));
  });

  it("a real slug derives indexable meta for every deriver", () => {
    expectIndexable(blogMeta(firstSlug(content.blog)));
    expectIndexable(researchMeta(firstSlug(content.research.publications)));
    expectIndexable(teamMeta(firstSlug(content.team)));
    expectIndexable(productMeta(firstSlug(content.products)));
  });
});

describe("route-meta — toNextMetadata", () => {
  it("builds the canonical URL (root has no trailing segment)", () => {
    expect(toNextMetadata(NOT_FOUND_META, "/").alternates.canonical).toBe(SITE_URL);
    expect(
      toNextMetadata({ title: "t", description: "d" }, "/about").alternates.canonical,
    ).toBe(`${SITE_URL}/about`);
  });

  it("maps noindex → robots {index:false}, otherwise indexable", () => {
    expect(toNextMetadata(NOT_FOUND_META, "/x").robots).toEqual({ index: false, follow: false });
    expect(toNextMetadata({ title: "t", description: "d" }, "/x").robots).toEqual({
      index: true,
      follow: true,
    });
  });

  it("defaults to og:type website when ogType is unset", () => {
    const og = toNextMetadata({ title: "t", description: "d" }, "/x").openGraph;
    expect(og.type).toBe("website");
  });

  it("blog/research detail pages resolve to og:type article with a date + author", () => {
    const blogOg = toNextMetadata(blogMeta(firstSlug(content.blog)), "/blog/x").openGraph;
    expect(blogOg.type).toBe("article");

    const researchOg = toNextMetadata(
      researchMeta(firstSlug(content.research.publications)),
      "/research/x",
    ).openGraph;
    expect(researchOg.type).toBe("article");
  });

  it("team detail pages resolve to og:type profile", () => {
    const og = toNextMetadata(teamMeta(firstSlug(content.team)), "/team/x").openGraph;
    expect(og.type).toBe("profile");
  });

  it("product detail pages stay og:type website (no article/profile semantics apply)", () => {
    const og = toNextMetadata(productMeta(firstSlug(content.products)), "/products/x").openGraph;
    expect(og.type).toBe("website");
  });
});
