import { readdirSync } from "node:fs";
import { describe, it, expect } from "vitest";
import {
  blogMeta,
  researchMeta,
  teamMeta,
  productMeta,
  routeMetadata,
  toNextMetadata,
  hasOwnOgImage,
  OWN_OG_IMAGE_SEGMENTS,
  NOT_FOUND_META,
  SITE_URL,
  type RouteMeta,
} from "../lib/route-meta";
import { content } from "../data";

const APP_DIR = new URL("../../app/", import.meta.url);

/**
 * Next's `mergeStaticMetadata` gate is an OWN-PROPERTY check
 * (`source.openGraph.hasOwnProperty('images')`), not a truthiness check — an
 * explicit `images: undefined` still counts as "specified" and still suppresses
 * the file-convention image. So absence assertions here must test the key, not
 * the value; `toBeUndefined()` would pass for a broken refactor.
 */
function hasOwnImagesKey(obj: object): boolean {
  return Object.prototype.hasOwnProperty.call(obj, "images");
}

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

/**
 * Regression pins for the site-wide defaults Next silently drops.
 *
 * `mergeMetadata` assigns `openGraph`, `twitter` and `alternates` WHOLESALE
 * from the page's own export — it does not deep-merge with the layout. When
 * toNextMetadata omitted these, every one of the ~30 routes that uses it
 * shipped with no og:image and no RSS autodiscovery, and only app/not-found.tsx
 * (which sets no openGraph/alternates) still inherited the layout's.
 */
describe("route-meta — site-level social/feed defaults survive Next's wholesale merge", () => {
  const staticMeta = toNextMetadata(routeMetadata["/"]!, "/");

  it("a static route carries the 1200x630 og:image", () => {
    expect(hasOwnImagesKey(staticMeta.openGraph)).toBe(true);
    expect(staticMeta.openGraph.images).toEqual([
      expect.objectContaining({ url: "/og-image.png", width: 1200, height: 630 }),
    ]);
    expect(staticMeta.openGraph.images?.[0]?.alt).toBeTruthy();
  });

  it("a static route carries a twitter image alongside the summary_large_image card", () => {
    expect(staticMeta.twitter.card).toBe("summary_large_image");
    expect(staticMeta.twitter.images).toEqual(["/og-image.png"]);
  });

  it("openGraph.siteName survives on every route shape", () => {
    expect(staticMeta.openGraph.siteName).toBe("Quesar by MLAI");
    expect(
      toNextMetadata(blogMeta(firstSlug(content.blog)), "/blog/x").openGraph.siteName,
    ).toBe("Quesar by MLAI");
    expect(toNextMetadata(NOT_FOUND_META, "/x").openGraph.siteName).toBe("Quesar by MLAI");
  });

  it("every route advertises the RSS feed via alternates.types", () => {
    for (const path of ["/", "/about", "/blog/some-slug", "/login"]) {
      const types = toNextMetadata(routeMetadata[path] ?? NOT_FOUND_META, path).alternates.types;
      expect(types["application/rss+xml"]).toEqual([
        expect.objectContaining({ url: "/feed.xml" }),
      ]);
    }
  });

  it("keeps the canonical URL next to the new alternates.types", () => {
    expect(staticMeta.alternates.canonical).toBe(SITE_URL);
  });
});

describe("route-meta — per-slug OG images are not clobbered by the site default", () => {
  // THE TRAP: Next's mergeStaticMetadata injects app/<family>/[slug]/opengraph-image.tsx
  // ONLY when the page's own openGraph has no `images` own property. If
  // toNextMetadata handed these routes the generic site card, all four families
  // would silently lose their per-title generated cards — the bug would be
  // invisible outside a real link preview. So the ABSENCE of the key is the
  // correct, load-bearing behaviour here; do not "complete" it.
  const dynamic: ReadonlyArray<[string, RouteMeta]> = [
    ["/blog/x", blogMeta(firstSlug(content.blog))],
    ["/research/x", researchMeta(firstSlug(content.research.publications))],
    ["/team/x", teamMeta(firstSlug(content.team))],
    ["/products/x", productMeta(firstSlug(content.products))],
  ];

  it("all four dynamic-slug families omit openGraph.images entirely", () => {
    for (const [path, meta] of dynamic) {
      expect({ path, hasImages: hasOwnImagesKey(toNextMetadata(meta, path).openGraph) }).toEqual({
        path,
        hasImages: false,
      });
    }
  });

  it("all four dynamic-slug families omit twitter.images entirely", () => {
    // Same reason: with no twitter-image.* file convention in app/, Next's
    // postProcessMetadata back-fills twitter.images from the resolved
    // openGraph.images — i.e. from the per-slug card. Setting it would override.
    for (const [path, meta] of dynamic) {
      expect({ path, hasImages: hasOwnImagesKey(toNextMetadata(meta, path).twitter) }).toEqual({
        path,
        hasImages: false,
      });
    }
  });

  it("index pages and static routes are NOT treated as per-slug detail pages", () => {
    for (const segment of OWN_OG_IMAGE_SEGMENTS) {
      expect(hasOwnOgImage(`/${segment}`)).toBe(false);
      expect(hasOwnOgImage(`/${segment}/a-slug`)).toBe(true);
    }
    expect(hasOwnOgImage("/")).toBe(false);
    expect(hasOwnOgImage("/showcase/film")).toBe(false);
  });

  // Set equality in BOTH directions against the filesystem: the list in
  // route-meta.ts must name every app/*/[slug]/opengraph-image.tsx that exists,
  // and nothing else. A fifth family added without updating the list fails here
  // rather than shipping the generic card over its generated one.
  it("OWN_OG_IMAGE_SEGMENTS matches the opengraph-image.tsx files on disk", () => {
    const onDisk = readdirSync(APP_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .filter((e) =>
        readdirSync(new URL(`${e.name}/`, APP_DIR), { withFileTypes: true }).some(
          (child) =>
            child.isDirectory() &&
            child.name === "[slug]" &&
            readdirSync(new URL(`${e.name}/[slug]/`, APP_DIR)).some((f) =>
              f.startsWith("opengraph-image."),
            ),
        ),
      )
      .map((e) => e.name);

    expect([...onDisk].sort()).toEqual([...OWN_OG_IMAGE_SEGMENTS].sort());
  });
});

describe("route-meta bylines", () => {
  // The content layer joins multi-team bylines with a MIDDLE DOT, so passing
  // authorName through unsplit invented a single author who does not exist
  // ("MLAI Research · WDBX Core" as one name). Pinned here because the same
  // bug existed independently in structured-data.ts — both now share
  // `bylineNames`, and this asserts the metadata half of that contract.
  it("splits a middle-dot research byline into separate article:authors", () => {
    const paper = content.research.publications.find((p) => p.authors?.includes("·"));
    expect(paper, "expected at least one middle-dot byline in the content layer").toBeDefined();
    const authors = paper!.authors!;

    const og = toNextMetadata(researchMeta(paper!.slug), `/research/${paper!.slug}`)
      .openGraph as { authors?: string[] };

    expect(og.authors!.length).toBeGreaterThan(1);
    expect(og.authors).toEqual(authors.split("·").map((n) => n.trim()));
    expect(og.authors!.some((a) => a.includes("·"))).toBe(false);
  });

  it("leaves the profile first/last-name derivation alone", () => {
    // `profile` uses .split(" ") for a real person's name — a different job
    // from byline splitting, and it must not be collapsed into it.
    const member = content.team.find((m) => m.slug);
    const og = toNextMetadata(teamMeta(member!.slug!), `/team/${member!.slug}`).openGraph as {
      type?: string;
      firstName?: string;
    };
    expect(og.type).toBe("profile");
    expect(og.firstName).toBe(member!.name.split(" ")[0]);
  });
});
