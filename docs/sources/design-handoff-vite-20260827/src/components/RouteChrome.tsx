import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE_URL } from "./site";

const META: Record<string, { title: string; description: string }> = {
  "/": {
    title: "MLAI — Privacy-first AI infrastructure",
    description:
      "MLAI — privacy-first AI infrastructure for Apple Silicon. WDBX, ABI Framework, and Abbey.",
  },
  "/wdbx": {
    title: "WDBX — MLAI",
    description: "The fastest vector database alive — HNSW, MVCC, and on-device search.",
  },
  "/abi": {
    title: "ABI Framework — MLAI",
    description: "Apple Silicon, fully spent — Metal GPU acceleration and ML runtime.",
  },
  "/abbey": {
    title: "Abbey — MLAI",
    description: "An assistant that remembers — locally. Three persona registers over verifiable memory.",
  },
  "/platform": {
    title: "Platform — MLAI",
    description: "One stack, no seams — WDBX, ABI, and Abbey on hardware you control.",
  },
  "/services": {
    title: "Services — MLAI",
    description: "Integration engineering, benchmark validation, and private deployment.",
  },
  "/research": {
    title: "Research — MLAI",
    description: "Publications and precise glossary for the MLAI stack.",
  },
  "/architecture": {
    title: "Architecture — MLAI",
    description: "Six layers and a hash-chained memory model you can verify.",
  },
  "/company": {
    title: "Company — MLAI",
    description: "Machine Learning Advanced Innovations, Inc. — principles, facts, FAQ.",
  },
  "/investors": {
    title: "Investors — MLAI",
    description: "Why on-device wins — thesis and measured numbers with provenance.",
  },
  "/contact": {
    title: "Contact — MLAI",
    description: "Request access. Tell us what you're building and where the data has to live.",
  },
};

function normalizePath(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function ensureMeta(attr: "name" | "property", key: string, content: string) {
  const sel = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(sel) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function ensureLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Scroll to top + document title / social meta on route change. */
export function RouteChrome() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const key = normalizePath(pathname);
    const meta = META[key] ?? {
      title: "Not found — MLAI",
      description: "This route isn't in the MLAI site index.",
    };
    document.title = meta.title;
    ensureMeta("name", "description", meta.description);
    ensureMeta("property", "og:title", meta.title);
    ensureMeta("property", "og:description", meta.description);
    ensureMeta("property", "og:url", `${SITE_URL}${key === "/" ? "/" : key}`);
    ensureMeta("name", "twitter:title", meta.title);
    ensureMeta("name", "twitter:description", meta.description);
    ensureLink("canonical", `${SITE_URL}${key === "/" ? "/" : key}`);
  }, [pathname]);

  return null;
}
