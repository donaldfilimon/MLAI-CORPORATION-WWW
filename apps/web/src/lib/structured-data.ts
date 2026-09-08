/**
 * JSON-LD structured-data builders for the dynamic-slug detail pages
 * (`/blog/:slug`, `/research/:slug`, `/team/:slug`, `/products/:slug`,
 * `/docs/:slug`, `/projects/:slug`).
 * Each returns a ready-to-stringify object (`@context`/`@type` included);
 * callers render it via a `<script type="application/ld+json">` in the
 * route's server-component `page.tsx`, alongside the OG/canonical metadata
 * from `route-meta.ts`. Kept separate from `route-meta.ts` because these
 * describe the *page's subject* (schema.org), not the page's HTML
 * head/social-card metadata.
 */

import { SITE_URL } from "@/lib/route-meta";
import { bylineNames } from "@/lib/byline";
import { toIsoDate } from "@/lib/dates";
import type { Blog, Research, Team, Products, Doc, Project } from "@/data";

type BlogPost = Blog[number];
type ResearchPub = Research["publications"][number];
type TeamMember = Team[number];
type Product = Products[number];

const ORG_REF = {
  "@type": "Organization" as const,
  name: "MLAI Corporation",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
};

/*
 * Deliberately no `image` on the Article builders, even though Google lists it
 * as recommended. The obvious filler — the site-wide `/og-image.png` — is the
 * exact thing `app/{blog,research}/[slug]/opengraph-image.tsx` was introduced to
 * stop these two routes from using, because a generic card doesn't reflect the
 * actual title. The right value is each slug's own generated OG image, but its
 * public URL is emitted by Next's file-convention build and isn't something this
 * module can name without guessing. Leave it absent rather than re-introduce the
 * retired asset; wire it up from whatever `opengraph-image` actually resolves to.
 */

/**
 * Bylines in the content layer are *team* names, not people. Every current
 * `blog[].author` / `research.publications[].authors` value is an MLAI unit
 * ("MLAI Research", "MLAI Safety Engineering", "MLAI Runtime Engineering") or a
 * product surface ("WDBX Core", "Abbey", "Product", "Agent Safety"), and a
 * multi-unit credit is joined with a **middle dot** — "MLAI Research · WDBX
 * Core". Two things used to be wrong about how that reached schema.org:
 *
 *   1. The split was on `,`, a separator no entry uses, so the whole credit came
 *      through as a single unsplit string.
 *   2. It was emitted as `@type: "Person"`, so Google's Article parser read
 *      "MLAI Research · WDBX Core" as one human's name.
 *
 * Hence: split on either separator and emit `Organization`. There is
 * deliberately **no** person-vs-organization heuristic — none is reliable over
 * these strings ("Agent Safety" and a two-word personal name are
 * indistinguishable by shape), and no current value names an individual. If a
 * named individual ever needs a byline, give the data layer a structured author
 * field (as `team` already has, via `personLd`) rather than teaching this to
 * guess from prose.
 */
function bylineOrganizations(byline: string | undefined) {
  const names = bylineNames(byline);
  return names.length ? names.map((name) => ({ "@type": "Organization" as const, name })) : null;
}

export function blogPostingLd(post: BlogPost) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const iso = toIsoDate(post.date);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": url,
    mainEntityOfPage: url,
    headline: post.title,
    description: post.excerpt,
    url,
    ...(iso ? { datePublished: iso, dateModified: iso } : {}),
    author: bylineOrganizations(post.author) ?? ORG_REF,
    publisher: ORG_REF,
    keywords: post.tag,
  };
}

export function researchArticleLd(paper: ResearchPub) {
  const url = `${SITE_URL}/research/${paper.slug}`;
  const iso = toIsoDate(paper.date);
  return {
    "@context": "https://schema.org",
    "@type": paper.documentType === "research-note" ? "ScholarlyArticle" : "TechArticle",
    "@id": url,
    mainEntityOfPage: url,
    headline: paper.title,
    abstract: paper.abstract,
    description: paper.abstract,
    url,
    ...(iso ? { datePublished: iso } : {}),
    dateModified: toIsoDate(paper.reviewedAt),
    citation: paper.sources.map(source => source.url),
    author: bylineOrganizations(paper.authors) ?? ORG_REF,
    publisher: ORG_REF,
    keywords: paper.tag,
  };
}

export function personLd(member: TeamMember) {
  const url = member.slug ? `${SITE_URL}/team/${member.slug}` : undefined;
  const sameAs = [
    member.socials?.github ? `https://github.com/${member.socials.github}` : null,
    member.socials?.x ? `https://x.com/${member.socials.x}` : null,
    member.socials?.web
      ? member.socials.web.startsWith("http")
        ? member.socials.web
        : `https://${member.socials.web}`
      : null,
  ].filter((v): v is string => v !== null);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    ...(url ? { "@id": url, mainEntityOfPage: url, url } : {}),
    name: member.name,
    jobTitle: member.role,
    description: member.tagline ?? member.bio,
    image: member.image,
    ...(member.location ? { homeLocation: { "@type": "Place", name: member.location } } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    worksFor: ORG_REF,
  };
}

export function softwareApplicationLd(product: Product) {
  const url = `${SITE_URL}/products/${product.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": url,
    mainEntityOfPage: url,
    name: product.name,
    description: product.intro,
    url,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: product.kicker,
    operatingSystem: "Cross-platform",
    publisher: ORG_REF,
  };
}

/*
 * `Doc` carries no date field, so this builder emits neither `datePublished`
 * nor `dateModified`. The other Article builders derive both from real data;
 * synthesizing one here would publish a fabricated date as structured data.
 */
export function docLd(doc: Doc) {
  const url = `${SITE_URL}/docs/${doc.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": url,
    mainEntityOfPage: url,
    headline: doc.title,
    description: doc.description,
    url,
    citation: doc.sources.map(source => source.url),
    author: ORG_REF,
    publisher: ORG_REF,
    keywords: doc.group,
  };
}

/*
 * `SoftwareSourceCode` rather than `SoftwareApplication`: every project record
 * describes a source repository and its documented scope, not a distributable
 * application. `codeRepository` is the field that carries that distinction.
 */
export function projectLd(project: Project) {
  const url = `${SITE_URL}/projects/${project.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": url,
    mainEntityOfPage: url,
    name: project.name,
    description: project.description,
    url,
    codeRepository: project.source.url,
    publisher: ORG_REF,
  };
}
