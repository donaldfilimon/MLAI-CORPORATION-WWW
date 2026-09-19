import { research } from "@/data/categories/research";
import { docNav } from "@/data/categories/docs-nav";
import { docs as portedDocs } from "@/data/categories/docs";
import type { SearchRecord } from "@/lib/docs-search";

/**
 * Flatten one content section into searchable text.
 *
 * Covers heading, paragraphs, list items, code (caption and body) and the
 * doc-only `note` aside. `math` is deliberately excluded: `searchDocuments`
 * is a lowercased substring matcher, and LaTeX source (`\\sum_{i=1}^{n}`)
 * contributes noise tokens no reader would ever type.
 *
 * Typed structurally rather than against `DocSection` so it serves both the
 * research sections (`BlogSectionSchema`, no `note`) and the ported docs
 * (`DocSectionSchema`, which extends it).
 */
export function sectionText(section: {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
  code?: { file?: string; code: string }[];
  note?: string;
}): string[] {
  return [
    section.heading ?? "",
    ...(section.paragraphs ?? []),
    ...(section.list ?? []),
    ...(section.code ?? []).flatMap((block) => [block.file ?? "", block.code]),
    section.note ?? "",
  ];
}

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
      ...paper.body.flatMap(sectionText),
    ].join(" "),
    href: `/research/${paper.slug}`,
  }));

  const ported: SearchRecord[] = portedDocs.map((doc) => ({
    slug: `docs:${doc.slug}`,
    title: doc.title,
    description: doc.description,
    group: doc.group,
    body: doc.body.flatMap(sectionText).join(" "),
    href: `/docs/${doc.slug}`,
  }));

  return [...docs, ...papers, ...ported];
}

