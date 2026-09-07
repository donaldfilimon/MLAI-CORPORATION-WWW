import Link from "next/link";
import { ArrowRight } from "lucide-react";

const thesis = [
  {
    title: "Privacy is becoming law",
    desc: "Regulated industries increasingly cannot send corpora to third-party clouds. On-device is the compliance story, not a feature.",
  },
  {
    title: "The silicon is already shipped",
    desc: "Apple Silicon's unified memory and Neural Engine sit idle across a large installed base. We write the software that spends them.",
  },
  {
    title: "Zero marginal cloud cost",
    desc: "Local-first inference and storage carry no per-query COGS. Unit economics improve with adoption instead of degrading — stated as a model, not a measured ARR claim.",
  },
] as const;

const modelFacts = [
  { k: "Core", v: "Open-source runtime & memory (abi, wdbx)" },
  { k: "Application", v: "IWL assistant workspace (Abbey personas)" },
  { k: "Model", v: "SDK licensing + integration services" },
  { k: "Entity", v: "Delaware C-Corp · Orlando, FL" },
  { k: "Founder", v: "Donald Filimon — Founder & Systems Architect" },
] as const;

export function InvestorsPage() {
  return (
    <div className="public-container marketing-page">
      <section className="marketing-hero">
        <div>
          <span className="eyeline wdbx">Investors</span>
          <h1>Infrastructure for resilient intelligence.</h1>
          <p className="hero-description">
            A positioning thesis, deliberately figure-free. Market sizes, ARR
            projections, raise amounts, and unit-economics targets stay in the
            deck with provenance tags there. This page states only what needs no
            invented metrics.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/contact">
              Request the deck <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" href="/architecture">
              Technical architecture
            </Link>
          </div>
        </div>
        <aside className="callout-card abi">
          <strong>Claims discipline</strong>
          <p>
            No customers, partners, funding rounds, TAM tables, or team beyond
            the founder are stated on public surfaces unless a repository
            artifact proves them. Evidence before projections.
          </p>
        </aside>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline wdbx">Thesis</span>
          <h2>Why on-device wins.</h2>
        </div>
        <div className="feature-grid three">
          {thesis.map((item) => (
            <article className="feature-card wdbx" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abi">Model</span>
          <h2>Open core.</h2>
          <p className="muted">
            Configuration facts for diligence — not performance benchmarks.
          </p>
        </div>
        <div className="formal-model-grid">
          <dl className="spec-list">
            {modelFacts.map((row) => (
              <div key={row.k}>
                <dt>{row.k}</dt>
                <dd>{row.v}</dd>
              </div>
            ))}
          </dl>
          <aside className="callout-card wdbx">
            <strong>What ships today</strong>
            <p>
              The local release combines a public technical website, an AI
              workspace (IWL), a developer console, and a customer portal.
              Billing and public production deployment are separate milestones —
              not claimed as live here.
            </p>
          </aside>
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abbey">Evidence</span>
          <h2>Where diligence starts.</h2>
        </div>
        <div className="feature-grid">
          <article className="feature-card abbey">
            <h3>Research library</h3>
            <p>
              Source-reviewed publications with pinned revisions — figures carry
              their receipts, or they are omitted.
            </p>
          </article>
          <article className="feature-card abi">
            <h3>Architecture</h3>
            <p>
              Runtime, memory, and control boundaries described without inventing
              throughput or accuracy scores.
            </p>
          </article>
        </div>
      </section>

      <nav className="next-up" aria-label="Continue reading">
        <Link className="next-up-card wdbx" href="/contact">
          <span className="eyeline wdbx">Contact</span>
          <strong>Request the deck — same inbox as every other inquiry.</strong>
          <span>
            Start a conversation <ArrowRight size={16} />
          </span>
        </Link>
        <Link className="next-up-card abbey" href="/research">
          <span className="eyeline abbey">Research</span>
          <strong>Publications and the formal retrieval model.</strong>
          <span>
            Open research <ArrowRight size={16} />
          </span>
        </Link>
      </nav>
    </div>
  );
}
