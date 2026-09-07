"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ContentIndex } from "@mlai/ui";
import type { researchItems } from "@/content/research";
import styles from "./research.module.css";

type Props = {
  items: typeof researchItems;
  topics: { id: string; name: string }[];
};
function SearchableResearchIndex({ items, topics }: Props) {
  const params = useSearchParams();
  const topic = params.get("topic") ?? "";
  const kind = params.get("type") ?? "";
  function update(key: string, value: string) {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    window.history.replaceState(null, "", url);
  }
  const filtered = items.filter(
    (item) => (!topic || topic === item.topic) && (!kind || kind === item.kind),
  );
  return (
    <>
      <div className={styles.filters}>
        <label>
          Research area
          <select
            value={topic}
            onChange={(event) => update("topic", event.target.value)}
          >
            <option value="">All areas</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
            <option value="application">Application notes</option>
            {topic &&
              ![...topics.map((t) => t.id), "application"].includes(topic) && (
                <option value={topic}>Unknown area</option>
              )}
          </select>
        </label>
        <label>
          Document type
          <select
            value={kind}
            onChange={(event) => update("type", event.target.value)}
          >
            <option value="">All types</option>
            <option value="overview">Overviews</option>
            <option value="research-note">Research notes</option>
            <option value="implementation-guide">Implementation guides</option>
            <option value="application-note">Application notes</option>
            {kind &&
              ![
                "overview",
                "research-note",
                "implementation-guide",
                "application-note",
              ].includes(kind) && <option value={kind}>Unknown type</option>}
          </select>
        </label>
        {(topic || kind) && (
          <button
            className="button secondary"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete("topic");
              url.searchParams.delete("type");
              window.history.replaceState(null, "", url);
            }}
          >
            Reset filters
          </button>
        )}
      </div>
      <ContentIndex
        Link={Link}
        items={filtered}
        searchLabel="Search research"
        placeholder="Search titles, descriptions, and areas…"
        query={params.get("q") ?? ""}
        onQueryChange={(q) => update("q", q)}
      />
    </>
  );
}
export function ResearchIndex(props: Props) {
  return (
    <Suspense
      fallback={
        <ContentIndex
          Link={Link}
          items={props.items}
          searchLabel="Search research"
        />
      }
    >
      <SearchableResearchIndex {...props} />
    </Suspense>
  );
}
