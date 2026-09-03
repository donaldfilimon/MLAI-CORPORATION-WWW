/**
 * Per-route SEO metadata — the single source the App Router pages read in
 * their generateMetadata exports. Extracted from the old RouteMetadata.tsx
 * (which set <title> client-side under react-router); titles/descriptions are
 * unchanged. Dynamic slugs (blog/research/team/products) derive from content.
 */
import { content } from "@/data";
import { bylineNames } from "@/lib/byline";
import { toIsoDate } from "@/lib/dates";

export const SITE_URL = "https://quesar.cloud";

/**
 * Site-level social/feed defaults.
 *
 * These have to be re-emitted by every page — see the long comment on
 * toNextMetadata for why app/layout.tsx cannot supply them. Paths stay
 * relative; `metadataBase` in app/layout.tsx expands them to absolute URLs.
 */
const SITE_NAME = "Quesar by MLAI";
const OG_IMAGE_URL = "/og-image.png";
const DEFAULT_OG_IMAGES = [
  {
    url: OG_IMAGE_URL,
    width: 1200,
    height: 630,
    alt: "Quesar by MLAI — private generation with an audit trail you control",
  },
];
const FEED_ALTERNATE_TYPES = {
  "application/rss+xml": [
    { url: "/feed.xml", title: "Quesar by MLAI — Research & Lab Notes" },
  ],
};

/**
 * The route segments whose `[slug]` detail pages generate their OWN per-title
 * OG image, via Next's `opengraph-image.tsx` file convention
 * (app/{blog,research,team,products}/[slug]/opengraph-image.tsx → src/lib/og.tsx).
 *
 * Why this list has to exist: Next's `mergeStaticMetadata`
 * (node_modules/next/dist/lib/metadata/resolve-metadata.js) injects a
 * file-convention image ONLY when the page's own metadata has no `images`
 * **own property** — the check is literally
 * `source.openGraph.hasOwnProperty('images')`, so an `images: undefined` is
 * still "specified" and still wins. Handing the generic site card to every
 * route would therefore silently replace all four families' per-slug cards
 * with it: one bug traded for another, invisible except in link previews.
 *
 * `route-meta.test.ts` pins this list against the filesystem in both
 * directions, so a fifth family cannot drift out of sync with it.
 */
export const OWN_OG_IMAGE_SEGMENTS = ["blog", "research", "team", "products"] as const;

const OWN_OG_IMAGE_PATH = new RegExp(`^/(?:${OWN_OG_IMAGE_SEGMENTS.join("|")})/[^/]+$`);

/**
 * True for a detail page that ships its own generated OG image, i.e. one whose
 * metadata must LEAVE `openGraph.images` unset so Next's file convention can
 * fill it in. Index pages (`/blog`) and every static route are false.
 */
export function hasOwnOgImage(path: string): boolean {
  return OWN_OG_IMAGE_PATH.test(path);
}

export type RouteMeta = {
  title: string;
  description: string;
  noindex?: boolean;
  /** Open Graph object type; defaults to "website" in toNextMetadata. */
  ogType?: "website" | "article" | "profile";
  /** ISO-8601 publish date — only read when ogType is "article". */
  publishedTime?: string;
  /** Byline / person name — article:author when ogType is "article", split
   *  into first/last name for og:profile when ogType is "profile". */
  authorName?: string;
};

export const DEFAULT_ROUTE_META: RouteMeta = {
  title: "Quesar by MLAI | Private generation with an audit trail you control",
  description:
    "Quesar by MLAI is invite-only private AI operations: WorkOS access, a metadata-only Cloudflare gateway, and KMS-wrapped audits you control. Fail closed.",
};

export const routeMetadata: Record<string, RouteMeta> = {
  "/": DEFAULT_ROUTE_META,
  "/about": {
    title: "About MLAI Corporation | High-Integrity AI Systems",
    description:
      "Learn how MLAI Corporation designs resilient AI systems for private deployment, retrieval provenance, safety evaluation, and operational control.",
  },
  "/research": {
    title: "MLAI Research | Quesar",
    description:
      "Explore MLAI research notes on WDBX retrieval, graph provenance, policy-gated agents, offline workflows, and production AI safety.",
  },
  "/services": {
    title: "MLAI Engineering Services | Quesar",
    description:
      "Audit, design, build, and harden AI systems that need traceability, private deployment paths, evaluation gates, and operational reliability.",
  },
  "/team": {
    title: "MLAI Team | AI Infrastructure and Safety Leadership",
    description:
      "Meet the MLAI team building high-integrity AI infrastructure, retrieval systems, agent orchestration, and production safety workflows.",
  },
  "/blog": {
    title: "MLAI Blog | Research Notes for Serious AI Systems",
    description:
      "Read field notes on retrieval, agent safety, operator UX, evaluation, deployment, and the engineering discipline behind production AI.",
  },
  "/docs": {
    title: "Quesar Architecture | Identity, Inference, and Audit Boundaries",
    description:
      "Review MLAI platform concepts, deployment modes, protected API surfaces, retrieval workflows, and safety evaluation guidance.",
  },
  // Retitled when the fabricated competitor charts came down. "Performance
  // Evidence" and "benchmark dashboards" described a page of invented
  // head-to-head figures; what remains is an architecture table and one
  // provenance-tagged GPU ladder. This text is also what `llms.txt` and the
  // sitemap publish, so overclaiming here re-exports the problem the page
  // removal was meant to fix.
  "/benchmarks": {
    title: "WDBX Architecture & Evidence | Quesar by MLAI",
    description:
      "How WDBX is built and what has actually been measured on MLAI hardware — architectural properties, and GPU figures labeled measured or target. No head-to-head comparisons against other products.",
  },
  "/demo": {
    title: "Live Demo | WDBX In-Browser Miniature",
    description:
      "Run an in-browser WDBX query-path miniature with cosine search over deterministic embeddings, an illustrative partition model, MVCC snapshots, and a hash-chained query log.",
  },
  "/financial-model": {
    title: "3-Statement Model | Interactive Tool",
    description:
      "An interactive, integrated three-statement financial model (income statement, balance sheet, cash flow) with a Base/Upside/Downside scenario toggle. Illustrative sample data for a fictional company, not MLAI financials.",
    noindex: true,
  },
  "/changelog": {
    title: "Changelog | MLAI Corporation",
    description:
      "Release history across the ABI runtime, WDBX storage engine, and the Abbey training stack — milestone markers aligned to documented project history.",
  },
  "/links": {
    title: "Link Hub | MLAI Corporation",
    description:
      "One screen for MLAI's important doors — source repositories, reference docs, product pages, research, and the founder's profile.",
  },
  "/privacy": {
    title: "Privacy Policy | MLAI Corporation",
    description:
      "Review how MLAI Corporation handles privacy, data practices, and responsible information handling for website and platform users.",
  },
  "/terms": {
    title: "Terms of Service | MLAI Corporation",
    description:
      "Read the MLAI Corporation terms governing access to the website, services, protected console, and related materials.",
  },
  "/security": {
    title: "Quesar Security | Identity, Encryption, and Audit Access",
    description:
      "Review MLAI security principles for authentication, private deployment, auditability, protected APIs, and production AI controls.",
  },
  "/login": {
    title: "Enter Quesar | Invite-Only Beta",
    description: "Sign in with an active MLAI organization invitation to access Quesar.",
    noindex: true,
  },
  "/signup": {
    title: "Request Quesar Access | Invite-Only Beta",
    description: "Request an invitation to evaluate Quesar with a scoped governed workflow.",
    noindex: true,
  },
  "/console": {
    title: "Quesar Console | Private AI Operations",
    description:
      "Use Quesar's organization-gated Gemini workspace and manage encrypted conversation audits.",
    noindex: true,
  },
  "/profile": {
    title: "Quesar Profile | Account and Access",
    description: "Manage the WorkOS profile used for Quesar access.",
    noindex: true,
  },
  "/showcase": {
    title: "Showcase | MLAI Films, Trailers, and Design Lab",
    description:
      "Watch the MLAI brand film, vision trailer, mega-trailer, and explainer — rendered live by a timeline engine with on-device neural narration — plus the design-system lab.",
  },
  "/showcase/film": {
    title: "Brand Film | MLAI Showcase",
    description:
      "The 69-second MLAI brand film: persona routing, verifiable memory, and governance, narrated by Abbey, Aviva, and Abi with on-device neural voices.",
  },
  "/showcase/trailer": {
    title: "Vision Trailer | MLAI Showcase",
    description:
      "The 62-second MLAI vision trailer — the spectrum identity, the three minds, and the architecture in motion, rendered live in the browser.",
  },
  "/showcase/mega": {
    title: "Mega-Trailer | MLAI Showcase",
    description:
      "The 282-second MLAI mega-trailer: every scene with a camera rig and neural background — the full-length cinematic treatment.",
  },
  "/showcase/explainer": {
    title: "Explainer Film | MLAI Showcase",
    description:
      "The extended MLAI explainer film: storage, routing, math, and the north star, with karaoke captions synced to neural narration.",
  },
  "/showcase/design": {
    title: "Design Lab | MLAI Showcase",
    description:
      "The MLAI design-system lab: brand, foundations, hero studies, marketing and console UI kits, and documentation boards.",
  },
  "/tf-pose-demo": {
    title: "Pose Detection Demo | Quesar by MLAI",
    description:
      "An isolated TensorFlow.js pose-detection prototype, separate from the MLAI platform.",
    noindex: true,
  },
};

export const NOT_FOUND_META: RouteMeta = {
  title: "Page Not Found | Quesar by MLAI",
  description: "The page you are looking for could not be found.",
  noindex: true,
};

export function blogMeta(slug: string): RouteMeta {
  const post = content.blog.find((p) => p.slug === slug);
  if (!post) return NOT_FOUND_META;
  return {
    title: `${post.title} | Quesar Research Notes`,
    description: post.excerpt,
    ogType: "article",
    publishedTime: toIsoDate(post.date),
    authorName: post.author,
  };
}

export function researchMeta(slug: string): RouteMeta {
  const paper = content.research.publications.find((p) => p.slug === slug);
  if (!paper) return NOT_FOUND_META;
  return {
    title: `${paper.title} | MLAI Research`,
    description: paper.abstract,
    ogType: "article",
    publishedTime: toIsoDate(paper.date),
    authorName: paper.authors,
  };
}

export function teamMeta(slug: string): RouteMeta {
  const member = content.team.find((m) => m.slug === slug);
  if (!member) return NOT_FOUND_META;
  return {
    title: `${member.name} | ${member.role}, MLAI Corporation`,
    description:
      member.tagline ?? `${member.name}, ${member.role} at MLAI Corporation. ${member.bio}`,
    ogType: "profile",
    authorName: member.name,
  };
}

export function productMeta(slug: string): RouteMeta {
  const product = content.products.find((p) => p.slug === slug);
  if (!product) return NOT_FOUND_META;
  return { title: `${product.name} | MLAI ${product.kicker}`, description: product.intro };
}

/**
 * Build a Next Metadata object from a RouteMeta + canonical path.
 *
 * This has to carry the site-level `openGraph.siteName` / `openGraph.images` /
 * `twitter.images` / `alternates.types` defaults even though app/layout.tsx
 * also declares them, because Next does NOT deep-merge metadata: for each key
 * present in a page's export, `mergeMetadata` assigns
 * `resolveOpenGraph(source.openGraph)` / `resolveTwitter(source.twitter)` /
 * `resolveAlternates(source.alternates)` **wholesale** over the layout's value.
 * So a page that sets any part of `openGraph` drops all of the layout's, and a
 * page that sets `alternates.canonical` drops the layout's `alternates.types`.
 * Leaving them out here is exactly what shipped every route with a text-only
 * social card and no RSS autodiscovery — the homepage included.
 *
 * The one exception is the four dynamic-slug families, which must keep
 * OMITTING `images` so their own `opengraph-image.tsx` can supply it — see
 * `hasOwnOgImage` above.
 */
export function toNextMetadata(meta: RouteMeta, path: string) {
  const canonical = `${SITE_URL}${path === "/" ? "" : path}`;
  const base = { title: meta.title, description: meta.description, url: canonical };

  // Typed as optional-property objects rather than `{...} | {}` so the key is
  // genuinely absent at runtime on the per-slug routes while staying readable
  // to TypeScript at the call sites.
  const ogImages: { images?: typeof DEFAULT_OG_IMAGES } = hasOwnOgImage(path)
    ? {}
    : { images: DEFAULT_OG_IMAGES };
  // Twitter follows the same gate on purpose. There is no `twitter-image.*`
  // file convention anywhere in app/, so on the per-slug routes Next's
  // `postProcessMetadata` back-fills `twitter.images` from the already-resolved
  // `openGraph.images` — which by then IS the per-slug generated card. Setting
  // it here would override that with the generic one; don't "fix" the omission.
  const twitterImages: { images?: string[] } = hasOwnOgImage(path)
    ? {}
    : { images: [OG_IMAGE_URL] };

  const openGraphBase =
    meta.ogType === "article"
      ? {
          ...base,
          type: "article" as const,
          ...(meta.publishedTime ? { publishedTime: meta.publishedTime } : {}),
          // Split, don't pass through: research bylines are middle-dot-joined
          // team names ("MLAI Research · WDBX Core"), and emitting the whole
          // string as one `article:author` invents a single author who does
          // not exist. The `profile` branch below deliberately does NOT use
          // this — its `.split(" ")` is a first/last-name derivation and only
          // ever runs for real team members.
          ...(bylineNames(meta.authorName).length
            ? { authors: bylineNames(meta.authorName) }
            : {}),
        }
      : meta.ogType === "profile"
        ? (() => {
            const [firstName, ...rest] = (meta.authorName ?? "").split(" ").filter(Boolean);
            return {
              ...base,
              type: "profile" as const,
              ...(firstName ? { firstName } : {}),
              ...(rest.length ? { lastName: rest.join(" ") } : {}),
            };
          })()
        : { ...base, type: "website" as const };

  const openGraph = { ...openGraphBase, siteName: SITE_NAME, ...ogImages };

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical, types: FEED_ALTERNATE_TYPES },
    openGraph,
    twitter: { card: "summary_large_image" as const, ...twitterImages },
    robots: meta.noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
