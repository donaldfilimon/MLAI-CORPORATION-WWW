/**
 * Per-route SEO metadata — the single source the App Router pages read in
 * their generateMetadata exports. Extracted from the old RouteMetadata.tsx
 * (which set <title> client-side under react-router); titles/descriptions are
 * unchanged. Dynamic slugs (blog/research/team/products) derive from content.
 */
import { content } from "@/data";

export const SITE_URL = "https://mlai-corp.com";

export type RouteMeta = {
  title: string;
  description: string;
  noindex?: boolean;
};

export const DEFAULT_ROUTE_META: RouteMeta = {
  title: "MLAI Corporation | Private AI Infrastructure for Production Teams",
  description:
    "MLAI Corporation builds private, traceable AI infrastructure for teams moving agents, retrieval, and evaluation from demos to governed production systems.",
};

export const routeMetadata: Record<string, RouteMeta> = {
  "/": DEFAULT_ROUTE_META,
  "/about": {
    title: "About MLAI Corporation | High-Integrity AI Systems",
    description:
      "Learn how MLAI Corporation designs resilient AI systems for private deployment, retrieval provenance, safety evaluation, and operational control.",
  },
  "/research": {
    title: "MLAI Research | Traceable Retrieval and Agent Safety",
    description:
      "Explore MLAI research notes on WDBX retrieval, graph provenance, policy-gated agents, offline workflows, and production AI safety.",
  },
  "/services": {
    title: "MLAI Services | AI System Audits, Architecture, and Deployment",
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
    title: "MLAI Docs | Platform Concepts and Protected API Guide",
    description:
      "Review MLAI platform concepts, deployment modes, protected API surfaces, retrieval workflows, and safety evaluation guidance.",
  },
  "/benchmarks": {
    title: "WDBX Benchmarks | MLAI Performance Evidence",
    description:
      "Review WDBX benchmark dashboards, workload summaries, and performance context for traceable retrieval infrastructure.",
  },
  "/demo": {
    title: "Live Demo | WDBX In-Browser Miniature",
    description:
      "Run a faithful in-browser miniature of the WDBX query path — real cosine search over deterministic embeddings, shard routing, MVCC snapshots, and a hash-chained query log.",
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
    title: "Security | MLAI Corporation",
    description:
      "Review MLAI security principles for authentication, private deployment, auditability, protected APIs, and production AI controls.",
  },
  "/login": {
    title: "Sign In | MLAI Corporation",
    description: "Sign in to access the protected MLAI console.",
    noindex: true,
  },
  "/signup": {
    title: "Create Account | MLAI Corporation",
    description: "Create an account to access the protected MLAI console.",
    noindex: true,
  },
  "/console": {
    title: "Console | MLAI Corporation",
    description:
      "Access protected MLAI console workflows and authenticated platform previews.",
    noindex: true,
  },
  "/profile": {
    title: "Profile | MLAI Corporation",
    description: "Manage your MLAI account profile.",
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
    title: "Pose Detection Demo | MLAI Corporation",
    description:
      "An isolated TensorFlow.js pose-detection prototype, separate from the MLAI platform.",
    noindex: true,
  },
};

export const NOT_FOUND_META: RouteMeta = {
  title: "Page Not Found | MLAI Corporation",
  description: "The page you are looking for could not be found.",
  noindex: true,
};

export function blogMeta(slug: string): RouteMeta {
  const post = content.blog.find((p) => p.slug === slug);
  if (!post) return NOT_FOUND_META;
  return { title: `${post.title} | MLAI Lab Notes`, description: post.excerpt };
}

export function researchMeta(slug: string): RouteMeta {
  const paper = content.research.publications.find((p) => p.slug === slug);
  if (!paper) return NOT_FOUND_META;
  return { title: `${paper.title} | MLAI Research`, description: paper.abstract };
}

export function teamMeta(slug: string): RouteMeta {
  const member = content.team.find((m) => m.slug === slug);
  if (!member) return NOT_FOUND_META;
  return {
    title: `${member.name} | ${member.role}, MLAI Corporation`,
    description:
      member.tagline ?? `${member.name}, ${member.role} at MLAI Corporation. ${member.bio}`,
  };
}

export function productMeta(slug: string): RouteMeta {
  const product = content.products.find((p) => p.slug === slug);
  if (!product) return NOT_FOUND_META;
  return { title: `${product.name} | MLAI ${product.kicker}`, description: product.intro };
}

/** Build a Next Metadata object from a RouteMeta + canonical path. */
export function toNextMetadata(meta: RouteMeta, path: string) {
  const canonical = `${SITE_URL}${path === "/" ? "" : path}`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "website" as const,
      url: canonical,
    },
    twitter: { card: "summary_large_image" as const },
    robots: meta.noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
