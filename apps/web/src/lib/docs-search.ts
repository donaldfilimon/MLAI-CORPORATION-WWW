/**
 * Deterministic local documentation search.
 *
 * Ported from the MLAI site review package (`lib/search.ts`). Input is treated
 * as plain text — never as HTML or a regular expression. The brief composer
 * from that package is intentionally not wired into a public route here;
 * keep any local-only brief tooling separate until a real backend exists.
 */

export interface SearchRecord {
  slug: string;
  title: string;
  description: string;
  group?: string;
  body: string;
  /** In-app destination: hash for /docs sections or a path for other surfaces. */
  href: string;
}

/** Rank documents by title > description > body token hits. Caps at 8 results. */
export function searchDocuments<T extends SearchRecord>(
  query: string,
  documents: readonly T[],
): T[] {
  const tokens = query
    .toLocaleLowerCase("en")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 12);

  if (!tokens.length) {
    return documents.slice(0, 8) as T[];
  }

  return documents
    .map((doc, index) => {
      const title = doc.title.toLocaleLowerCase("en");
      const description = doc.description.toLocaleLowerCase("en");
      const body = doc.body.toLocaleLowerCase("en");
      let score = 0;
      for (const token of tokens) {
        if (title.includes(token)) score += 6;
        else if (description.includes(token)) score += 3;
        else if (body.includes(token)) score += 1;
        else return { doc, score: -1, index };
      }
      return { doc, score, index };
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 8)
    .map((x) => x.doc);
}
