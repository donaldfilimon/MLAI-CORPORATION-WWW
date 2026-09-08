export type SearchSection = { id: string; title: string; text: string };
export type Searchable = {
  url: string;
  title: string;
  description: string;
  body: string;
  group: string;
  sections?: SearchSection[];
};
export type SearchResult<T extends Searchable> = {
  entry: T;
  url: string;
  excerpt: string;
  score: number;
};
export type HighlightPart = { text: string; match: boolean };

/** Apply the same normalization to both sides of a search. No query is executable. */
export function normalizeSearch(value: string): string {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en-US');
}
export function queryTerms(value: string): string[] {
  return [...new Set(normalizeSearch(value.slice(0, 160)).trim().split(/\s+/).filter(Boolean))];
}
export function isLocalRoute(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//') && !/[\\\u0000-\u001f]/.test(url);
}
function termScore(text: string, terms: string[], weight: number): number {
  const normalized = normalizeSearch(text);
  return terms.reduce((score, term) => score + (normalized.includes(term) ? weight : 0), 0);
}
function excerpt(text: string, terms: string[], length = 190): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= length) return clean;
  const normalized = normalizeSearch(clean);
  const positions = terms.map(term => normalized.indexOf(term)).filter(index => index >= 0);
  const hit = positions.length ? Math.min(...positions) : 0;
  let start = Math.max(0, hit - 55);
  if (start) {
    const wordBoundary = clean.indexOf(' ', start);
    if (wordBoundary >= start && wordBoundary < hit) start = wordBoundary + 1;
  }
  let end = Math.min(clean.length, start + length);
  if (end < clean.length) {
    const boundary = clean.lastIndexOf(' ', end);
    if (boundary > hit + 20) end = boundary;
  }
  return (start ? '…' : '') + clean.slice(start, end) + (end < clean.length ? '…' : '');
}

/** Rank complete records once; never confuse a displayed limit with the total count. */
export function searchPageResults<T extends Searchable>(query: string, entries: T[], limit = 10): {
  query: string; results: SearchResult<T>[]; total: number;
} {
  const cleanQuery = query.slice(0, 160).trim();
  const terms = queryTerms(cleanQuery);
  const maximum = Math.max(0, Math.min(100, Number.isFinite(limit) ? Math.floor(limit) : 10));
  const ranked: (SearchResult<T> & { order: number })[] = [];
  entries.forEach((entry, order) => {
    if (!isLocalRoute(entry.url)) return;
    const sections = entry.sections || [];
    const combined = normalizeSearch([entry.title, entry.description, entry.body, ...sections.map(s => s.title + ' ' + s.text)].join(' '));
    if (terms.length && !terms.every(term => combined.includes(term))) return;
    const score = termScore(entry.title, terms, 12) + termScore(entry.description, terms, 4) + termScore(entry.body, terms, 1);
    const titleMatch = terms.length > 0 && terms.every(term => normalizeSearch(entry.title).includes(term));
    const section = sections.map((value, index) => ({ value, index, score: termScore(value.title, terms, 6) + termScore(value.text, terms, 2) }))
      .filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.index - b.index)[0]?.value;
    const target = !titleMatch && section ? entry.url.split('#')[0] + '#' + encodeURIComponent(section.id) : entry.url;
    const context = !terms.length || titleMatch ? entry.description : section?.text || (termScore(entry.description, terms, 1) ? entry.description : entry.body);
    ranked.push({ entry, url: target, excerpt: excerpt(context, terms), score, order });
  });
  ranked.sort((a, b) => b.score - a.score || a.order - b.order);
  return { query: cleanQuery, total: ranked.length, results: ranked.slice(0, terms.length ? maximum : Math.min(maximum, 6)) };
}

/** Compatibility for callers interested only in matched records. */
export function searchDocuments<T extends Searchable>(query: string, entries: T[]): T[] {
  return searchPageResults(query, entries).results.map(result => result.entry);
}
export function matchProject(query: string, category: string, project: { name: string; description: string; category: string }): boolean {
  const text = normalizeSearch(project.name + ' ' + project.description);
  return (category === 'all' || category === project.category) && queryTerms(query).every(term => text.includes(term));
}

/** Produce text segments, not HTML. Offsets retain Unicode characters and accents. */
export function highlightMatches(text: string, query: string): HighlightPart[] {
  const terms = queryTerms(query);
  if (!terms.length || !text) return [{ text, match: false }];
  let normalized = '', offset = 0;
  const starts: number[] = [], ends: number[] = [];
  for (const character of text) {
    const part = normalizeSearch(character);
    for (let i = 0; i < part.length; i++) { starts.push(offset); ends.push(offset + character.length); }
    if (!part && ends.length) ends[ends.length - 1] = offset + character.length;
    normalized += part;
    offset += character.length;
  }
  const ranges: [number, number][] = [];
  for (const term of terms) {
    let index = normalized.indexOf(term);
    while (index >= 0) {
      ranges.push([starts[index], ends[index + term.length - 1]]);
      index = normalized.indexOf(term, index + Math.max(term.length, 1));
    }
  }
  ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged: [number, number][] = [];
  for (const range of ranges) {
    const previous = merged[merged.length - 1];
    if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
    else merged.push([...range]);
  }
  const parts: HighlightPart[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false });
    parts.push({ text: text.slice(start, end), match: true }); cursor = end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
  return parts.length ? parts : [{ text, match: false }];
}
