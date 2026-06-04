import { useLocation } from "react-router-dom";

const SITE_URL = "https://mlai-corp.com";

type RouteMeta = {
  title: string;
  description: string;
  noindex?: boolean;
};

const DEFAULT_ROUTE_META: RouteMeta = {
  title: "MLAI Corporation | Private AI Infrastructure for Production Teams",
  description:
    "MLAI Corporation builds private, traceable AI infrastructure for teams moving agents, retrieval, and evaluation from demos to governed production systems.",
};

const routeMetadata: Record<string, RouteMeta> = {
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
};

export function RouteMetadata() {
  const { pathname } = useLocation();
  const metadata = routeMetadata[pathname] ?? DEFAULT_ROUTE_META;
  const canonical = `${SITE_URL}${pathname === "/" ? "" : pathname}`;

  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:card" content="summary_large_image" />
      {metadata.noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
    </>
  );
}
