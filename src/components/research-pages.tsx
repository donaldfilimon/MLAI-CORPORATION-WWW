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

export function ResearchLanding() {
  return (
    <div className={`public-container article-layout ${styles.research}`}>
      <header className="article-header">
        <span className="eyeline">MLAI Research</span>
        <h1>Research you can follow to the source.</h1>
        <p>
          Explore agent behavior, memory, evidence selection, compute, and
          integrations. Each publication keeps its implementation evidence and
          limitations in view.
        </p>
        <div className={styles.metrics}>
          <span>{publications.length} publications</span>
          <span>{researchTracks.length} research areas</span>
          <span>3 application notes</span>
        </div>
      </header>
      <nav className={styles.tracks} aria-label="Research areas">
        {researchTracks.map((track) => (
          <Link
            key={track.id}
            href={`/research/${track.overviewSlug}`}
            className={styles.track}
          >
            <span className="eyeline">{track.id.toUpperCase()}</span>
            <h2>
              {track.name} <ArrowUpRight size={18} aria-hidden="true" />
            </h2>
            <p>{track.description}</p>
          </Link>
        ))}
      </nav>
      <section aria-labelledby="research-library">
        <div className="section-heading">
          <h2 id="research-library">The research library</h2>
          <Link className="text-link" href="/docs">
            Application documentation <ArrowRight size={16} />
          </Link>
        </div>
        <p className="muted">
          Reference implementation reviews are dated snapshots. Application
          notes describe this workspace; research status does not establish a
          deployed capability.
        </p>
        <ResearchIndex
          items={researchItems}
          topics={researchTracks.map(({ id, name }) => ({ id, name }))}
        />
      </section>
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
              application guides to see the integrations and boundaries
              available in this workspace.
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
