import { research } from "@/data/categories/research";
import { docNav } from "@/data/categories/docs-nav";
import { docs as portedDocs } from "@/data/categories/docs";
import type { SearchRecord } from "@/lib/docs-search";

/** Build the local search index from canonical docs nav + research records. */
export function buildDocsSearchIndex(): SearchRecord[] {
  const docs: SearchRecord[] = docNav.flatMap((group) =>
    group.items.map((item) => ({
      slug: `docs:${item.id}`,
      title: item.label,
      description: item.description,
      group: group.group,
      body: item.body,
      href: `/docs#${item.id}`,
    })),
  );

  const papers: SearchRecord[] = research.publications.map((paper) => ({
    slug: `research:${paper.slug}`,
    title: paper.title,
    description: paper.practicalSummary,
    group: "Research",
    body: [
      paper.tag,
      paper.topic,
      paper.statusNote,
      paper.limitations.join(" "),
      ...paper.body.flatMap((section) => [
        section.heading ?? "",
        ...section.paragraphs,
      ]),
    ].join(" "),
    href: `/research/${paper.slug}`,
  }));

  const ported: SearchRecord[] = portedDocs.map((doc) => ({
    slug: `docs:${doc.slug}`,
    title: doc.title,
    description: doc.description,
    group: doc.group,
    body: doc.body.flatMap((s) => [s.heading ?? "", ...s.paragraphs]).join(" "),
    href: `/docs/${doc.slug}`,
  }));

  return [...docs, ...papers, ...ported];
}

