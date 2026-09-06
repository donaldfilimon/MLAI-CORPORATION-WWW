"use client";
import { useId, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { Anchor, type LinkComponent } from "./link.js";
export interface ContentIndexItem {
  href: string;
  title: string;
  description: string;
  category: string;
}
export interface ContentIndexProps {
  items: ContentIndexItem[];
  searchLabel?: string;
  placeholder?: string;
  query?: string;
  onQueryChange?: (query: string) => void;
  Link?: LinkComponent;
}
export function ContentIndex({
  items,
  searchLabel = "Search documentation",
  placeholder = "Search articles and guides…",
  query,
  onQueryChange,
  Link = Anchor,
}: ContentIndexProps) {
  const [localQuery, setLocalQuery] = useState("");
  const q = query ?? localQuery;
  const input = useRef<HTMLInputElement>(null);
  const resultsId = useId();
  function setQuery(value: string) {
    setLocalQuery(value);
    onQueryChange?.(value);
  }
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const filtered = items.filter((i) => {
    const text = `${i.title} ${i.description} ${i.category}`.toLowerCase();
    return terms.every((term) => text.includes(term));
  });
  return (
    <>
      <div className="search-input content-search">
        <Search size={18} aria-hidden="true" />
        <input
          ref={input}
          type="search"
          aria-label={searchLabel}
          aria-controls={resultsId}
          placeholder={placeholder}
          value={q}
          onChange={(e) => setQuery(e.target.value)}
        />
        {q && (
          <button
            type="button"
            className="content-search-clear"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              input.current?.focus();
            }}
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      <p className="small muted" role="status" aria-atomic="true">
        {filtered.length} {filtered.length === 1 ? "article" : "articles"} found
      </p>
      <div className="article-index" id={resultsId}>
        {filtered.map((i) => (
          <Link key={i.href} href={i.href}>
            <span className="eyeline">{i.category}</span>
            <h2>
              {i.title}
              <ArrowRight size={20} />
            </h2>
            <p>{i.description}</p>
          </Link>
        ))}
        {!filtered.length && (
          <div className="empty">
            <p>No articles match “{q}”.</p>
            <p>Try fewer words or clear your search.</p>
          </div>
        )}
      </div>
    </>
  );
}
