import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { knowledge } from "@/content/knowledge";
import { StatusBadge } from "./status-badge";

export function KnowledgePage() {
  return (
    <div className="public-container marketing-page">
      <section className="marketing-hero">
        <div>
          <span className="eyeline abbey">Knowledge base</span>
          <h1>Everything MLAI holds to be true.</h1>
          <p className="hero-description">
            The motto, taglines per surface, personas, routing prior, substrate
            invariant, and operating principles — consolidated from the
            repositories and the master reference. No invented benchmarks.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/repositories">
              Claims ledgers <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" href="/research">
              Research
            </Link>
          </div>
        </div>
        <aside className="callout-card abbey">
          <strong>Brand split · architecture freeze 2026-09-02</strong>
          <p>
            Lab tokens are shared across MLAI. Product narratives are not.
            &ldquo;Intelligence Without Limits&rdquo; belongs to Abbey, Abbey
            Bot, and ABI — gated by the claims ledger. Quesar never carries it.
          </p>
        </aside>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abbey">Motto</span>
          <h2>{knowledge.motto}</h2>
        </div>
        <div className="formal-model-grid">
          <dl className="spec-list">
            {knowledge.taglines.map((row) => (
              <div key={row.surface}>
                <dt>{row.surface}</dt>
                <dd>{row.line}</dd>
              </div>
            ))}
          </dl>
          <aside className="callout-card wdbx">
            <strong>Status vocabulary</strong>
            <p>
              Every public claim should be tagged Current, Partial, Proposed, or
              Not claimed — the repositories&apos; own words, never conflated with
              provenance tags on measured figures.
            </p>
          </aside>
        </div>
        <div className="feature-grid" style={{ marginTop: 20 }}>
          {knowledge.statusVocabulary.map((item) => (
            <article className="feature-card abbey" key={item.key}>
              <StatusBadge status={item.key} />
              <p style={{ marginTop: 12 }}>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abbey">Personas</span>
          <h2>Three registers, fixed accents.</h2>
          <p className="muted">
            Personas are not the product accent axis: the product &ldquo;abi&rdquo;
            is violet, the persona &ldquo;Abi&rdquo; is cyan.
          </p>
        </div>
        <div className="feature-grid three">
          {knowledge.personas.map((persona) => (
            <article
              className={`feature-card ${persona.accent}`}
              key={persona.name}
            >
              <span className={`persona-dot ${persona.accent === "abi" ? "aviva" : persona.accent === "wdbx" ? "abi" : "abbey"}`} />
              <p className="muted" style={{ marginBottom: 8 }}>
                {persona.role}
              </p>
              <h3>{persona.name}</h3>
              <p>{persona.register}</p>
            </article>
          ))}
        </div>
        <div className="formal-model-grid" style={{ marginTop: 28 }}>
          <div>
            <div className="formula-block" aria-label="Routing prior">
              w⁽⁰⁾ = (0.40, 0.30, 0.30)
            </div>
            <p className="muted" style={{ marginTop: 12 }}>
              {knowledge.routingPrior}
            </p>
          </div>
          <div>
            <div className="formula-block" aria-label="Blend">
              R_final = α R_Abbey + (1−α) R_Aviva
            </div>
            <p className="muted" style={{ marginTop: 12 }}>
              α &gt; 0.8 pure Abbey · 0.2 ≤ α ≤ 0.8 blend mixed by Abi · α &lt;
              0.2 pure Aviva.
            </p>
          </div>
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline wdbx">Substrate invariant</span>
          <h2>Memory is not database lookup.</h2>
        </div>
        <blockquote className="pull-quote wdbx">
          <p>{knowledge.substrateInvariant}</p>
          <cite>donaldfilimon/wdbx README</cite>
        </blockquote>
        <div className="formal-model-grid" style={{ marginTop: 24 }}>
          <div className="formula-block" aria-label="Hybrid score and hash chain">
            sᵢⱼ = σⱼ · τⱼ · γⱼ · πⱼ ··· Hᵢ = SHA-256(Hᵢ₋₁ ‖ …)
          </div>
          <aside className="callout-card wdbx">
            <strong>Proposed, not Current</strong>
            <p>
              The multiplicative collapse is exactly what the constitution&apos;s
              invariant I3 forbids — evidence-weighted retrieval is Proposed on
              the WDBX ledger, not Current.
            </p>
          </aside>
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abi">Operating principles</span>
          <h2>Four refusals.</h2>
        </div>
        <div className="feature-grid">
          {knowledge.operatingPrinciples.map((principle, index) => (
            <article className="feature-card abi" key={principle}>
              <h3>{String(index + 1).padStart(2, "0")}</h3>
              <p>{principle}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline wdbx">Glossary</span>
          <h2>Terms we use precisely.</h2>
        </div>
        <div className="feature-grid">
          {knowledge.glossary.map((item) => (
            <article className="feature-card wdbx" key={item.term}>
              <h3>{item.term}</h3>
              <p>{item.def}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abbey">FAQ</span>
          <h2>Common questions.</h2>
        </div>
        <div className="faq-list">
          {knowledge.faq.map((item) => (
            <details className="faq-item" key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <nav className="next-up" aria-label="Continue reading">
        <Link className="next-up-card abi" href="/repositories">
          <span className="eyeline abi">Repositories</span>
          <strong>Each codebase&apos;s own claims ledger.</strong>
          <span>
            Open ledgers <ArrowRight size={16} />
          </span>
        </Link>
        <Link className="next-up-card abbey" href="/research">
          <span className="eyeline abbey">Research</span>
          <strong>Source-reviewed papers behind the substrate.</strong>
          <span>
            Browse research <ArrowRight size={16} />
          </span>
        </Link>
      </nav>
    </div>
  );
}
