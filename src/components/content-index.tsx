"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
export function ContentIndex({
  items,
}: {
  items: {
    href: string;
    title: string;
    description: string;
    category: string;
  }[];
}) {
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
          aria-label="Search documentation"
          placeholder="Search articles and guides…"
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
