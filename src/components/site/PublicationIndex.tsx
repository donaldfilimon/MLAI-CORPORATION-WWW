"use client";

import { useMemo, useState, type ElementType } from "react";
import { cn } from "@/lib/utils";

export interface Publication {
  slug: string;
  title: string;
  summary?: string;
  date?: string;
  tags?: readonly string[];
}

export interface PublicationIndexProps {
  /** The publications to list. Supply from `content.research.publications`. */
  items: readonly Publication[];
  /** Route prefix each slug is appended to. @default "/research" */
  basePath?: string;
  /**
   * Component to render each entry with. Defaults to a plain `<a>` so this
   * carries no router dependency — see the same note on `NextUp`.
   */
  linkComponent?: ElementType;
  className?: string;
}

const ALL = "All";

/**
 * A tag-filterable publication list.
 *
 * Filtering is client-side over an already-rendered list, so every entry is in
 * the server HTML and remains reachable (and indexable) whether or not the
 * filter ever hydrates.
 */
export function PublicationIndex({
  items,
  basePath = "/research",
  linkComponent,
  className,
}: PublicationIndexProps) {
  const L: ElementType = linkComponent ?? "a";
  const [active, setActive] = useState<string>(ALL);

  const tags = useMemo(() => {
    const seen = new Set<string>();
    for (const item of items) for (const tag of item.tags ?? []) seen.add(tag);
    return [ALL, ...Array.from(seen).sort()];
  }, [items]);

  // Fall back to ALL when `items` changes to a set that no longer contains the
  // active tag — otherwise the list renders empty with no chip marked pressed.
  const activeTag = tags.includes(active) ? active : ALL;

  const visible = useMemo(
    () => (activeTag === ALL ? items : items.filter((i) => i.tags?.includes(activeTag))),
    [items, activeTag],
  );

  return (
    <div className={cn("space-y-6", className)}>
      {tags.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter publications by tag">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActive(tag)}
              aria-pressed={activeTag === tag}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400",
                activeTag === tag
                  ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                  : "border-white/10 text-text-dim hover:border-white/20 hover:text-white",
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {visible.length > 0 && (
      <ul role="list" className="divide-y divide-white/6 overflow-hidden rounded-xl border border-white/8">
        {visible.map((item) => (
          <li key={item.slug}>
            <L
              href={`${basePath}/${item.slug}`}
              className="block px-5 py-4 no-underline transition-colors hover:bg-white/2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-400"
            >
              <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-sm font-medium text-white">{item.title}</span>
                {item.date && (
                  <span className="text-[11px] text-text-dim" style={{ fontFamily: "var(--font-mono)" }}>
                    {item.date}
                  </span>
                )}
              </span>
              {item.summary && (
                <span className="mt-1 block text-xs leading-relaxed text-text-dim text-pretty">
                  {item.summary}
                </span>
              )}
            </L>
          </li>
        ))}
      </ul>
      )}

      {/* Always mounted inside a live region: a node inserted on filter change
          is not announced, so a user who filters to zero results hears nothing
          and is left thinking the page broke (WCAG 4.1.3). */}
      <p
        role="status"
        className={visible.length ? "sr-only" : "text-sm text-text-dim"}
      >
        {items.length === 0
          ? "No publications yet."
          : visible.length === 0
            ? "No publications match that tag."
            : `${visible.length} publications shown.`}
      </p>
    </div>
  );
}
