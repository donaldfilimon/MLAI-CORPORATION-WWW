import Link from "next/link";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  implementationStudies,
  publications,
  researchTracks,
  researchItems,
  researchGuideLinks,
  type ImplementationStudy,
  type Publication,
} from "@/content/research";
import { ResearchIndex } from "./research-index";
import styles from "./research.module.css";

export function ResearchLanding() {
  return (
    <div className={`public-container marketing-page ${styles.research}`}>
      <section className={styles.researchHero}>
        <span className="eyeline abbey">MLAI Research</span>
        <h1>Research you can build on.</h1>
        <p className="hero-description">
          Explore the ideas behind MLAI&apos;s AI systems, memory, evidence
          selection, and developer tools. Start with the practical application,
          then examine the research and its limits.
        </p>
      </section>

      <nav className={styles.areaGrid} aria-label="Research areas">
        {researchTracks.map((track) => (
          <Link
            key={track.id}
            href={`/research/${track.overviewSlug}`}
            className={styles.areaCard}
            data-research-area={track.id}
          >
            <h2>
              {track.name} <ArrowUpRight size={18} aria-hidden="true" />
            </h2>
            <p>{track.description}</p>
            <dl>
              <div>
                <dt>Practical applications</dt>
                <dd>{track.application}</dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd>{track.availability}</dd>
              </div>
            </dl>
            <span>
              Explore research and limitations <ArrowRight size={15} />
            </span>
          </Link>
        ))}
      </nav>

      <section
        id="implementation-studies"
        className="system-section marketing-section"
        aria-labelledby="implementation-heading"
      >
        <div className="section-intro">
          <span className="eyeline wdbx">From research to systems</span>
          <h2 id="implementation-heading">
            Source-backed implementation studies
          </h2>
          <p className="muted">
            {implementationStudies.length} studies connect the collection to
            concrete systems. Each preserves its source revisions, operating
            boundaries, and relationship to the research.
          </p>
        </div>
        <div className={styles.studyList}>
          {implementationStudies.map((study) => (
            <Link
              key={study.slug}
              href={`/research/implementations/${study.slug}`}
              className={styles.studyRow}
              data-implementation-study={study.slug}
            >
              <span>
                {study.relatedTopics
                  .map((topic) => topic.toUpperCase())
                  .join(" / ")}
              </span>
              <h3>{study.title}</h3>
              <p>{study.summary}</p>
              <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section
        id="research-library"
        className="system-section marketing-section"
        aria-labelledby="publications-heading"
      >
        <div className="section-intro">
          <span className="eyeline abbey">The research collection</span>
          <h2 id="publications-heading">The research collection</h2>
          <p className="muted">
            {publications.length} articles and guides, plus three application
            notes. Filter by research area or document type. Source material,
            application notes, and generated workspace interpretation remain
            distinct.
          </p>
        </div>
        <ResearchIndex
          items={researchItems}
          topics={researchTracks.map(({ id, name }) => ({ id, name }))}
        />
      </section>
    </div>
  );
}

export function ImplementationStudyArticle({
  study,
}: {
  study: ImplementationStudy;
}) {
  const related = study.relatedTopics.flatMap((topic) => {
    const track = researchTracks.find((item) => item.id === topic);
    return track ? [track] : [];
  });

  return (
    <div className={`public-container article-layout ${styles.research}`}>
      <header className="article-header">
        <Link className="text-link" href="/research#implementation-studies">
          ← Implementation studies
        </Link>
        <span className="eyeline abbey">From research to systems</span>
        <h1>{study.title}</h1>
        <p>{study.summary}</p>
        <div className={styles.metrics}>
          <span>Source-backed implementation study</span>
          <span>{study.sources.length} pinned sources</span>
        </div>
      </header>
      <div className="article-body">
        <aside aria-label="On this page">
          <strong>On this page</strong>
          {study.sections.map((section, index) => (
            <a key={section.heading} href={`#study-section-${index}`}>
              {section.heading}
            </a>
          ))}
          <a href="#operating-boundaries">Operating boundaries</a>
          <a href="#source-evidence">Source evidence</a>
          <a href="#related-research">Related research</a>
        </aside>
        <div className={styles.body}>
          <aside className={styles.sourceBoundary}>
            This page summarizes revision-pinned source material. It is not a
            generated workspace interpretation and does not establish current
            deployment or live-service acceptance.
          </aside>
          {study.sections.map((section, index) => (
            <section id={`study-section-${index}`} key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
          <section id="operating-boundaries">
            <h2>Operating boundaries</h2>
            <ul>
              {study.limitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </section>
          <section id="source-evidence">
            <h2>Source evidence</h2>
            <p>
              Each source is pinned to the exact revision and content digest
              reviewed for this study.
            </p>
            <ol className={styles.sources}>
              {study.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url}>
                    {source.title} <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                  <span>
                    revision <code>{source.revision}</code>
                  </span>
                  <span>
                    SHA-256 <code>{source.sha256}</code>
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <section id="related-research">
            <h2>Related research</h2>
            <nav
              className={styles.relatedStudies}
              aria-label="Related research"
            >
              {related.map((track) => (
                <Link key={track.id} href={`/research/${track.overviewSlug}`}>
                  {track.name} <ArrowRight size={15} aria-hidden="true" />
                </Link>
              ))}
            </nav>
          </section>
        </div>
      </div>
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
