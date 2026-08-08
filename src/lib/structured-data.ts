/**
 * JSON-LD structured-data builders for the dynamic-slug detail pages
 * (`/blog/:slug`, `/research/:slug`, `/team/:slug`, `/products/:slug`).
 * Each returns a ready-to-stringify object (`@context`/`@type` included);
 * callers render it via a `<script type="application/ld+json">` in the
 * route's server-component `page.tsx`, alongside the OG/canonical metadata
 * from `route-meta.ts`. Kept separate from `route-meta.ts` because these
 * describe the *page's subject* (schema.org), not the page's HTML
 * head/social-card metadata.
 */

import { SITE_URL } from "@/lib/route-meta";
import { toIsoDate } from "@/lib/dates";
import type { Blog, Research, Team, Products } from "@/data";

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
    author: post.author ? { "@type": "Person", name: post.author } : ORG_REF,
    publisher: ORG_REF,
    keywords: post.tag,
  };
}

export function researchArticleLd(paper: ResearchPub) {
  const url = `${SITE_URL}/research/${paper.slug}`;
  const iso = toIsoDate(paper.date);
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "@id": url,
    mainEntityOfPage: url,
    headline: paper.title,
    abstract: paper.abstract,
    description: paper.abstract,
    url,
    ...(iso ? { datePublished: iso, dateModified: iso } : {}),
    author: paper.authors
      ? paper.authors.split(",").map((name) => ({ "@type": "Person", name: name.trim() }))
      : ORG_REF,
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
