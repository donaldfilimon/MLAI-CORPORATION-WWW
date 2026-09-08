"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useRef } from "react";
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
  const query = params.get("q") ?? "";
  const index = useRef<HTMLDivElement>(null);
  function update(key: string, value: string, push = false) {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    window.history[push ? "pushState" : "replaceState"](null, "", url);
  }
  function clear(all = false) {
    const url = new URL(window.location.href);
    for (const key of all ? ["q", "topic", "type"] : ["topic", "type"])
      url.searchParams.delete(key);
    window.history.pushState(null, "", url);
    index.current
      ?.querySelector<HTMLInputElement>('input[type="search"]')
      ?.focus();
  }
  const filtered = items.filter(
    (item) =>
      (!topic || item.topics.includes(topic)) && (!kind || kind === item.kind),
  );
  const filters = (
    <div className={styles.filters}>
      <label>
        Research area
        <select
          name="topic"
          value={topic}
          onChange={(event) => update("topic", event.target.value, true)}
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
          name="type"
          value={kind}
          onChange={(event) => update("type", event.target.value, true)}
        >
          <option value="">All types</option>
          <option value="overview">Overviews</option>
          <option value="research-note">Research notes</option>
          <option value="implementation-guide">Implementation guides</option>
          <option value="implementation-study">Implementation studies</option>
          <option value="application-note">Application notes</option>
          {kind &&
            ![
              "overview",
              "research-note",
              "implementation-guide",
              "implementation-study",
              "application-note",
            ].includes(kind) && <option value={kind}>Unknown type</option>}
        </select>
      </label>
      {(topic || kind) && (
        <button
          type="button"
          className="button secondary"
          onClick={() => clear()}
        >
          Reset filters
        </button>
      )}
    </div>
  );
  return (
    <div ref={index}>
      <ContentIndex
        controls={filters}
        Link={Link}
        items={filtered}
        searchLabel="Search research"
        placeholder="Search titles, descriptions, and areas…"
        query={query}
        onQueryChange={(q) => update("q", q)}
        renderMetadata={(item) => (
          <p className="small muted">
            {item.evidenceScope}
            {item.reviewedAt && (
              <>
                {" "}
                · Source reviewed{" "}
                <time dateTime={item.reviewedAt}>
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeZone: "UTC",
                  }).format(new Date(`${item.reviewedAt}T00:00:00Z`))}
                </time>
              </>
            )}
          </p>
        )}
        emptyState={
          <>
            <p>
              {topic || kind
                ? `No research matches these filters${query.trim() ? ` and “${query.trim()}”` : ""}.`
                : `No research matches “${query.trim()}”.`}
            </p>
            <p>Try another research area, document type, or search term.</p>
            <button
              type="button"
              className="button secondary"
              onClick={() => clear(true)}
            >
              Clear all
            </button>
          </>
        }
      />
    </div>
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
          searchDisabled
        />
      }
    >
      <SearchableResearchIndex {...props} />
    </Suspense>
  );
}
