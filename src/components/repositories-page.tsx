"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@mlai/ui";
import { knowledge, repos, type Repo } from "@/content/knowledge";
import { StatusBadge } from "./status-badge";

function RepoPanel({
  repo,
  onSelectRepo,
}: {
  repo: Repo;
  onSelectRepo: (slug: string) => void;
}) {
  return (
    <div className="repo-panel" id={repo.slug}>
      <div className="repo-panel-main">
        <p className={`eyeline ${repo.accent}`}>{repo.role}</p>
        <h2>{repo.oneLiner}</h2>
        <div className="repo-meta">
          <Badge variant="outline">{repo.language}</Badge>
          {repo.license ? <Badge variant="outline">{repo.license}</Badge> : null}
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            {repo.org}/{repo.name} <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
        <div className="repo-summary">
          {repo.summary.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {repo.gate ? (
          <aside className={`callout-card ${repo.accent}`}>
            <strong>Gate</strong>
            <p>
              <code>{repo.gate}</code>
            </p>
          </aside>
        ) : null}
      </div>

      <Card className="claims-ledger">
        <CardHeader>
          <CardTitle>Claims ledger</CardTitle>
          <CardDescription>
            Copied from the README; status words are the repo&apos;s own. Not a
            benchmark table.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="claims-list">
            {repo.claims.map((claim) => (
              <li key={claim.text}>
                <StatusBadge status={claim.status} />
                <p>{claim.text}</p>
              </li>
            ))}
          </ul>
          {repo.related.length > 0 ? (
            <p className="repo-related">
              Related ·{" "}
              {repo.related.map((slug, index) => (
                <span key={slug}>
                  {index > 0 ? " · " : null}
                  <a
                    href={`#${slug}`}
                    onClick={(event) => {
                      event.preventDefault();
                      onSelectRepo(slug);
                      window.history.replaceState(null, "", `#${slug}`);
                    }}
                  >
                    {slug}
                  </a>
                </span>
              ))}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function RepositoriesPage() {
  const [active, setActive] = useState(repos[0]?.slug ?? "abi");

  useEffect(() => {
    const fromHash = window.location.hash.replace(/^#/, "");
    if (fromHash && repos.some((repo) => repo.slug === fromHash)) {
      setActive(fromHash);
    }
    const onHash = () => {
      const slug = window.location.hash.replace(/^#/, "");
      if (slug && repos.some((repo) => repo.slug === slug)) setActive(slug);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const selected = repos.find((repo) => repo.slug === active) ?? repos[0];

  return (
    <div className="public-container marketing-page">
      <section className="marketing-hero">
        <div>
          <span className="eyeline abi">Repositories · read 2026-09-05</span>
          <h1>Every repository, on its own terms.</h1>
          <p className="hero-description">
            What each codebase claims — Current, Partial, Proposed, Not claimed
            — copied from the repositories&apos; own READMEs and ledgers. No
            figure here is a benchmark.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/knowledge">
              Knowledge base <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" href="/research">
              Research
            </Link>
          </div>
        </div>
        <aside className="callout-card abi">
          <strong>Claims discipline</strong>
          <p>
            QPS, latency, accuracy, and TAM stay off this page. Status chips are
            ledger words, not provenance tags for measured results.
          </p>
        </aside>
      </section>

      <div className="repo-tabs" role="tablist" aria-label="Repositories">
        {repos.map((repo) => {
          const selectedTab = repo.slug === selected.slug;
          return (
            <button
              key={repo.slug}
              type="button"
              role="tab"
              aria-selected={selectedTab}
              className={selectedTab ? "active" : undefined}
              onClick={() => {
                setActive(repo.slug);
                window.history.replaceState(null, "", `#${repo.slug}`);
              }}
            >
              {repo.name}
            </button>
          );
        })}
      </div>

      {selected ? (
        <RepoPanel
          repo={selected}
          onSelectRepo={setActive}
        />
      ) : null}

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abbey">Status vocabulary</span>
          <h2>Four words, never conflated.</h2>
        </div>
        <div className="feature-grid">
          {knowledge.statusVocabulary.map((item) => (
            <article className="feature-card abbey" key={item.key}>
              <StatusBadge status={item.key} />
              <p style={{ marginTop: 12 }}>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <nav className="next-up" aria-label="Continue reading">
        <Link className="next-up-card abbey" href="/knowledge">
          <span className="eyeline abbey">Knowledge base</span>
          <strong>Motto, taglines, personas, substrate invariant.</strong>
          <span>
            Open knowledge <ArrowRight size={16} />
          </span>
        </Link>
        <Link className="next-up-card abi" href="/research">
          <span className="eyeline abi">Research</span>
          <strong>The papers behind the substrate and the router.</strong>
          <span>
            Browse research <ArrowRight size={16} />
          </span>
        </Link>
      </nav>
    </div>
  );
}
