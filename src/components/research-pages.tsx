import Link from "next/link";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  publications,
  researchTracks,
  researchItems,
  researchGuideLinks,
  type Publication,
} from "@/content/research";
import { ResearchIndex } from "./research-index";
import styles from "./research.module.css";

const linesOfWork = [
  {
    accent: "wdbx",
    title: "WDBX Core",
    desc: "Backtrace-aware retrieval, graph weighting, chunk provenance, and high-throughput vector search for production AI systems.",
    href: "/research/wdbx-overview",
  },
  {
    accent: "abbey",
    title: "Agent Safety",
    desc: "Permissioning, policy locks, prompt-injection resistance, role separation, and human escalation protocols.",
    href: "/research/ai-overview",
  },
  {
    accent: "abi",
    title: "Runtime Performance",
    desc: "GPU acceleration, memory layout, low-latency search, edge deployment, and repeatable benchmark design.",
    href: "/research/gpu-overview",
  },
] as const;

const scoringFactors = [
  { k: "σⱼ", v: "cosine similarity over the HNSW index" },
  { k: "τⱼ", v: "temporal recency — exponential half-life decay" },
  { k: "γⱼ", v: "causal-hop weight, γⱼ = max(0.25, 0.6^hⱼ)" },
  { k: "πⱼ", v: "source authority from the trust table" },
] as const;

const authorityRows: [string, string][] = [
  ["inferred", "0.30"],
  ["user_stated", "0.78"],
  ["tool_verified", "0.86"],
  ["file_verified", "0.90"],
  ["system_pinned", "1.00"],
];

const glossary = [
  {
    term: "SEA",
    def: "Sparse Evidence Attention — eight criteria with fixed weights, then greedy packing under a hard token budget and diversity constraint.",
  },
  {
    term: "Backtrace",
    def: "Walking a weighted retrieval path backward to the hop where confidence or authority dropped, then rewinding.",
  },
  {
    term: "Authority",
    def: "Trust scale from inferred → user-stated → tool-verified → file-verified → system-pinned (formal model values in the table above).",
  },
  {
    term: "Claims discipline",
    def: "Figures on this site stay tied to source-reviewed publications. Comparative study tables and unsourced StatBlocks are omitted until they ship with provenance.",
  },
] as const;

export function ResearchLanding() {
  return (
    <div className={`public-container marketing-page ${styles.research}`}>
      <section className="marketing-hero">
        <div>
          <span className="eyeline abbey">Research</span>
          <h1>Figures with their receipts.</h1>
          <p className="hero-description">
            Technical analyses of the WDBX architecture and the Abbey–Aviva–Abi
            multi-persona framework. Claims stay tagged to source-reviewed
            publications; where a claim conflicts with measured benchmarks, the
            measured number wins everywhere else on this site.
          </p>
          <div className="button-row">
            <a className="button primary" href="#research-library">
              Browse the index <ArrowRight size={18} />
            </a>
            <Link className="button secondary" href="/docs">
              Application docs
            </Link>
          </div>
        </div>
        <aside className="callout-card abbey">
          <strong>What this page will not invent</strong>
          <p>
            No TAM tables, no unsourced latency/throughput StatBlocks, and no
            comparative “this system vs GPT-4” grids until a harness artifact
            ships in brand sources. Counts below are library inventory only.
          </p>
        </aside>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abbey">Tracks</span>
          <h2>Three lines of work.</h2>
          <p className="muted">
            Thematic entry points into the source-reviewed library (
            {publications.length} publications · {researchTracks.length} detailed
            research areas).
          </p>
        </div>
        <div className="feature-grid three">
          {linesOfWork.map((line) => (
            <Link
              key={line.title}
              href={line.href}
              className={`feature-card ${line.accent} feature-card-link`}
            >
              <h3>
                {line.title} <ArrowUpRight size={16} aria-hidden="true" />
              </h3>
              <p>{line.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="research-library"
        className="system-section marketing-section"
        aria-labelledby="research-library-heading"
      >
        <div className="section-intro">
          <span className="eyeline abbey">Publications</span>
          <h2 id="research-library-heading">The index.</h2>
          <p className="muted">
            Filter by area or document type. Reference implementation reviews are
            dated snapshots; research status does not establish a deployed
            capability.
          </p>
        </div>
        <ResearchIndex
          items={researchItems}
          topics={researchTracks.map(({ id, name }) => ({ id, name }))}
        />
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline wdbx">The formal model</span>
          <h2>Composite retrieval score.</h2>
          <p className="muted">
            From the WDBX paper: where the design names a target it is labelled as
            such. These equations encode the scoring model — not measured
            benchmark results.
          </p>
        </div>
        <div className="formal-model-grid">
          <div>
            <div className="formula-block" aria-label="Hybrid score">
              sᵢⱼ = σⱼ · τⱼ · γⱼ · πⱼ
            </div>
            <dl className="spec-list scoring-list">
              {scoringFactors.map((row) => (
                <div key={row.k}>
                  <dt>{row.k}</dt>
                  <dd>{row.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="table-scroll registers-table">
            <table>
              <caption>
                Authority-weighted records — an inferred guess is never treated
                like a system-pinned fact.
              </caption>
              <thead>
                <tr>
                  <th>Source class</th>
                  <th>Trust</th>
                </tr>
              </thead>
              <tbody>
                {authorityRows.map(([klass, trust]) => (
                  <tr key={klass}>
                    <td>
                      <code>{klass}</code>
                    </td>
                    <td>{trust}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <aside className="callout-card wdbx" style={{ marginTop: 28 }}>
          <strong>Hash-chained audit log</strong>
          <p>
            Hᵢ = SHA-256(Hᵢ₋₁ ‖ tᵢ ‖ seqᵢ ‖ pᵢ ‖ mᵢ), H₀ = 0 — every write lands
            in a re-verifiable chain. That property makes retrieval explainable to
            an auditor, not just a developer.
          </p>
        </aside>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abi">Glossary</span>
          <h2>Terms we use precisely.</h2>
        </div>
        <div className="feature-grid">
          {glossary.map((item) => (
            <article className="feature-card abi" key={item.term}>
              <h3>{item.term}</h3>
              <p>{item.def}</p>
            </article>
          ))}
        </div>
      </section>

      <nav className="next-up" aria-label="Continue reading">
        <Link className="next-up-card wdbx" href="/wdbx">
          <span className="eyeline wdbx">WDBX</span>
          <strong>Where the measured numbers live.</strong>
          <span>
            Open WDBX <ArrowRight size={16} />
          </span>
        </Link>
        <Link className="next-up-card abi" href="/platform">
          <span className="eyeline abi">Platform</span>
          <strong>The layers these papers inform.</strong>
          <span>
            View platform <ArrowRight size={16} />
          </span>
        </Link>
      </nav>
    </div>
  );
}

export function ResearchArticle({
  publication: p,
}: {
  publication: Publication;
}) {
  const related = publications.filter(
    (item) => item.topic === p.topic && item.slug !== p.slug,
  );
  const guide = researchGuideLinks[p.topic];
  return (
    <div className={`public-container article-layout ${styles.research}`}>
      <header className="article-header">
        <Link className="text-link" href="/research">
          ← Research library
        </Link>
        <div className={styles.metrics}>
          <span className="eyeline">
            {p.topic.toUpperCase()} · {p.documentType.replaceAll("-", " ")}
          </span>
          <span>{p.readTime}</span>
        </div>
        <h1>{p.title}</h1>
        <p>{p.abstract}</p>
        <div className={styles.metrics}>
          <span>{p.authors || "MLAI Research"}</span>
          <span>{p.date}</span>
          <span>
            Source review <time dateTime={p.reviewedAt}>{p.reviewedAt}</time>
          </span>
        </div>
      </header>
      <div className="article-body">
        <aside aria-label="On this page">
          <strong>On this page</strong>
          <a href="#evidence">Evidence & limitations</a>
          {p.body.map((section, i) => (
            <a key={i} href={`#research-section-${i}`}>
              {section.heading || `Section ${i + 1}`}
            </a>
          ))}
          <a href="#sources">Supporting sources</a>
          {p.attachments.length > 0 && <a href="#downloads">Downloads</a>}
          <Link href="/research">All research</Link>
        </aside>
        <div className={styles.body}>
          <section
            id="evidence"
            className={styles.evidence}
            aria-label="Research evidence and availability"
          >
            <span className={styles.status}>{p.status} · reference scope</span>
            <h2>Evidence & limitations</h2>
            <p>{p.statusNote}</p>
            <p>{p.practicalSummary}</p>
            <ul>
              {p.limitations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a className="text-link" href="#sources">
              Inspect {p.sources.length} supporting sources{" "}
              <ArrowRight size={16} />
            </a>
          </section>
          {p.body.map((section, i) => (
            <section id={`research-section-${i}`} key={i}>
              {section.heading && <h2>{section.heading}</h2>}
              {section.paragraphs.map((text, j) => (
                <p key={j}>{text}</p>
              ))}
              {section.list && (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.math?.map((tex) => (
                <div
                  key={tex}
                  className={styles.math}
                  dangerouslySetInnerHTML={{
                    __html: katex.renderToString(tex, {
                      displayMode: true,
                      throwOnError: true,
                      trust: false,
                      output: "htmlAndMathml",
                    }),
                  }}
                />
              ))}
              {section.code?.map((block, j) => (
                <figure key={j}>
                  {block.file && <figcaption>{block.file}</figcaption>}
                  <pre tabIndex={0} aria-label={block.file || "Code example"}>
                    <code>{block.code}</code>
                  </pre>
                </figure>
              ))}
            </section>
          ))}
          <section id="sources">
            <h2>Supporting sources</h2>
            <p>
              Evidence is pinned to the revisions reviewed for this publication.
            </p>
            <ol className={styles.sources}>
              {p.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url}>
                    {source.title} <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                  <span>
                    {source.kind} · revision <code>{source.revision}</code>
                  </span>
                </li>
              ))}
            </ol>
          </section>
          {p.attachments.length > 0 && (
            <section id="downloads">
              <h2>Publication downloads</h2>
              {p.attachments.map((a) => (
                <div className={styles.download} key={a.url}>
                  <a className="text-link" href={a.url} download>
                    <Download size={17} />
                    {a.title} (PDF)
                  </a>
                  <p>
                    {a.edition === "historical"
                      ? "Historical edition · superseded"
                      : "Current source-reviewed edition"}{" "}
                    · {a.date} · {a.pages} pages
                  </p>
                  <small>
                    SHA-256: <code>{a.sha256}</code>
                  </small>
                </div>
              ))}
            </section>
          )}
          <section className={styles.evidence}>
            <h2>Connect the research to your work</h2>
            <p>
              These publications document the reference projects. Use the
              application guides to see the integrations and boundaries available
              in this workspace.
            </p>
            {guide && (
              <Link className="text-link" href={guide.href}>
                {guide.label}
                <ArrowRight size={16} />
              </Link>
            )}
            <Link className="text-link" href="/app">
              Open the Abbey workspace
              <ArrowRight size={16} />
            </Link>
          </section>
          {related.length > 0 && (
            <nav aria-label="Related research">
              <h2>Continue reading</h2>
              {related.map((item) => (
                <Link
                  className="editorial-row"
                  href={`/research/${item.slug}`}
                  key={item.slug}
                >
                  <span>{item.title}</span>
                  <ArrowRight size={16} />
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
