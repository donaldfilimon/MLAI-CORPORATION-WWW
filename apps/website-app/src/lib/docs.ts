import { docPaths, pages } from "@/content/pages";

export type DocsNavItem = {
  href: string;
  title: string;
  description: string;
  category: string;
};

/** Stable sidebar / palette order for existing documentation articles. */
const CATEGORY_ORDER = [
  "Documentation",
  "Integration guide",
  "API reference",
  "Operations",
] as const;

export function getDocsNavItems(): DocsNavItem[] {
  return docPaths.map((path) => ({
    href: `/${path}`,
    title: pages[path].title,
    description: pages[path].description,
    category: pages[path].category,
  }));
}

export function groupDocsNavItems(
  items: DocsNavItem[],
): Array<readonly [string, DocsNavItem[]]> {
  const map = new Map<string, DocsNavItem[]>();
  for (const item of items) {
    const list = map.get(item.category) ?? [];
    list.push(item);
    map.set(item.category, list);
  }

  const ranked: Array<readonly [string, DocsNavItem[]]> = [];
  const seen = new Set<string>();
  for (const category of CATEGORY_ORDER) {
    const entries = map.get(category);
    if (!entries) continue;
    ranked.push([category, entries]);
    seen.add(category);
  }
  for (const [category, entries] of map) {
    if (seen.has(category)) continue;
    ranked.push([category, entries]);
  }
  return ranked;
}
