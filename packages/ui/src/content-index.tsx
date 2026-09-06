"use client";
import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
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
  Link?: LinkComponent;
}
export function ContentIndex({
  items,
  searchLabel = "Search documentation",
  placeholder = "Search articles and guides…",
  Link = Anchor,
}: ContentIndexProps) {
  const [q, setQ] = useState("");
  const filtered = items.filter((i) =>
    `${i.title} ${i.description} ${i.category}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return (
    <>
      <label className="search-input">
        <Search size={18} />
        <input
          aria-label={searchLabel}
          placeholder={placeholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>
      <div className="article-index">
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
        {!filtered.length && <p className="empty">No articles match “{q}”.</p>}
      </div>
    </>
  );
}
