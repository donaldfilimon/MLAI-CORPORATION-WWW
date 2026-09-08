import data from "./research-data.json" with { type: "json" };
import implementationData from "./implementation-data.json" with { type: "json" };
import { pages, researchPaths } from "./pages";

// The collection is an immutable source-reviewed snapshot, imported from MLAI
// Research. Provenance and exact input hashes live in docs/research-merge.
export interface ResearchSection {
  heading?: string;
  paragraphs: string[];
  math?: string[];
  list?: string[];
  code?: { lang?: string; file?: string; code: string }[];
}
export interface Publication {
  slug: string;
  tag: string;
  title: string;
  date: string;
  abstract: string;
  readTime: string;
  authors?: string;
  topic: string;
  documentType: string;
  practicalSummary: string;
  status: string;
  statusNote: string;
  reviewedAt: string;
  sources: { title: string; url: string; revision: string; kind: string }[];
  limitations: string[];
  attachments: {
    title: string;
    url: string;
    edition: string;
    date: string;
    sha256: string;
    pages: number;
  }[];
  body: ResearchSection[];
}
export interface ImplementationStudy {
  title: string;
  slug: string;
  summary: string;
  relatedTopics: string[];
  sections: { heading: string; paragraphs: string[] }[];
  sources: {
    title: string;
    url: string;
    revision: string;
    sha256: string;
  }[];
  limitations: string[];
}
export const researchTracks = data.tracks;
export const publications: Publication[] = data.publications;
export const publicationPaths = publications.map((p) => `research/${p.slug}`);
export const implementationStudies: ImplementationStudy[] = implementationData;
export const implementationPaths = implementationStudies.map(
  (study) => `research/implementations/${study.slug}`,
);
export function findPublication(path: string) {
  return publications.find((p) => `research/${p.slug}` === path);
}
export function findImplementationStudy(path: string) {
  return implementationStudies.find(
    (study) => `research/implementations/${study.slug}` === path,
  );
}
export const researchItems = [
  ...publications.map((p) => ({
    href: `/research/${p.slug}`,
    title: p.title,
    description: p.abstract,
    category: `${p.topic.toUpperCase()} · ${p.documentType.replaceAll("-", " ")}`,
    topic: p.topic,
    kind: p.documentType,
  })),
  ...researchPaths.map((path) => ({
    href: `/${path}`,
    title: pages[path].title,
    description: pages[path].description,
    category: pages[path].category,
    topic: "application",
    kind: "application-note",
  })),
];
export const researchGuideLinks: Record<
  string,
  { href: string; label: string }
> = {
  ai: { href: "/abbey", label: "Explore the Abbey workspace" },
  wdbx: { href: "/docs/wdbx", label: "Connect the WDBX gateway" },
  sea: {
    href: "/research/provenance",
    label: "Read about application source provenance",
  },
  gpu: { href: "/docs/abi", label: "Inspect ABI capabilities" },
  mcp: { href: "/docs/api", label: "Read the application API reference" },
  tui: { href: "/docs/abi", label: "Connect the ABI runtime" },
};
