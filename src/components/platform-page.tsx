import Link from "next/link";
import { ArrowRight } from "lucide-react";

const layers = [
  {
    accent: "wdbx",
    title: "01 — Trace Layer",
    desc: "Captures retrieval paths, policy checks, model decisions, tool calls, and operator interventions as inspectable events. What the agent saw.",
  },
  {
    accent: "abi",
    title: "02 — Control Plane",
    desc: "Defines which agents can plan, review, execute, escalate, or abstain under each workflow condition. What it was allowed to do.",
  },
  {
    accent: "abbey",
    title: "03 — Evaluation Mesh",
    desc: "Runs regression scenarios across retrieval faithfulness, latency, safety behavior, and prompt injection. How it was tested.",
  },
  {
    accent: "wdbx",
    title: "04 — Private Runtime",
    desc: "Packages orchestration, retrieval, audit logs, and controls for cloud, VPC, on-premise, and offline-first deployments. Where it runs.",
  },
] as const;

const refusals = [
  {
    accent: "abi",
    label: "No unbounded writes",
    body: "No autonomous write action without an observable policy boundary.",
  },
  {
    accent: "wdbx",
    label: "No untraceable claims",
    body: "No retrieval claim without a traceable source or confidence signal.",
  },
  {
    accent: "abbey",
    label: "No context-free benchmarks",
    body: "No benchmark without environment notes, workload shape, and reproducibility context.",
  },
  {
    accent: "abi",
    label: "No plan without rollback",
    body: "No deployment plan that ignores rollback, incident review, and human escalation.",
  },
] as const;

const audiences = [
  {
    title: "Regulated software teams",
    desc: "Shipping AI copilots into customer workflows with audit obligations.",
  },
  {
    title: "Research organizations",
    desc: "Private retrieval over sensitive technical corpora.",
  },
  {
    title: "Security & compliance teams",
    desc: "Evaluating tool-using autonomous agents before they touch production.",
  },
  {
    title: "Infrastructure teams",
    desc: "Deploying AI near edge devices, private clouds, or constrained networks.",
  },
] as const;

const faq = [
  {
    q: "What is the WDBX Engine?",
    a: "The Weighted Directed Backtrace eXecution engine is a retrieval and orchestration pattern that keeps context as weighted paths. It is designed to help teams inspect why a result was produced, which sources were used, and where confidence dropped.",
  },
  {
    q: "How does the Abbey–Aviva–Abi framework differ from traditional agents?",
    a: "Instead of giving one agent every responsibility, the framework separates creative planning, safety review, and technical execution. That separation makes permissions easier to reason about and gives operators clearer intervention points.",
  },
  {
    q: "Can MLAI systems run in private infrastructure?",
    a: "Yes. We design for VPC, on-premise, hybrid, and offline-first deployment paths when data residency, network isolation, or customer policy requires it.",
  },
  {
    q: "Do you replace existing LLMs?",
    a: "Usually no. MLAI focuses on orchestration, retrieval, evaluation, and safety layers that can sit around existing model providers or self-hosted models.",
  },
  {
    q: "How do you test safety behavior?",
    a: "We build scenario suites for prompt injection, source poisoning, permission escalation, contradictory context, low-confidence retrieval, and human-approval bypass attempts.",
  },
] as const;

const traceLines = [
  "retrieve · hnsw · k=10 · sources pinned",
  "policy gate · write blocked → escalate",
  "operator approval · granted",
  "execute · persona=aviva",
  "evaluate · appended to chain",
  "",
  "labeled illustrative — event shape, not data",
] as const;

export function PlatformPage() {
  return (
    <div className="public-container marketing-page">
      <section className="marketing-hero">
        <div>
          <span className="eyeline abi">Platform · bounded autonomy</span>
          <h1>Autonomy you can answer for.</h1>
          <p className="hero-description">
            The MLAI platform wraps orchestration in four layers that make
            autonomy inspectable: what the agent saw, what it was allowed to do,
            how it was tested, and where it runs.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/architecture">
              Read the architecture <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" href="/app">
              Open workspace
            </Link>
          </div>
        </div>
        <aside className="trace-panel" aria-label="Illustrative trace">
          <div className="trace-panel-label">trace ❯</div>
          <pre>
            {traceLines.map((line) => (
              <span key={line || "blank"}>
                {line || " "}
                {"\n"}
              </span>
            ))}
          </pre>
        </aside>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abi">The four layers</span>
          <h2>Each with one job.</h2>
          <p className="muted">
            An agent that plans, calls tools, and acts is useful exactly to the
            degree you can see what it did and constrain what it may do.
          </p>
        </div>
        <div className="feature-grid">
          {layers.map((layer) => (
            <article className={`feature-card ${layer.accent}`} key={layer.title}>
              <h3>{layer.title}</h3>
              <p>{layer.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abi">Operating principles</span>
          <h2>Four refusals, standing.</h2>
        </div>
        <div className="feature-grid">
          {refusals.map((item) => (
            <aside className={`callout-card ${item.accent}`} key={item.label}>
              <strong>{item.label}</strong>
              <p>{item.body}</p>
            </aside>
          ))}
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abi">Who it&apos;s for</span>
          <h2>Built for constrained contexts.</h2>
        </div>
        <div className="feature-grid">
          {audiences.map((item) => (
            <article className="feature-card abi" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline wdbx">FAQ</span>
          <h2>Asked and answered.</h2>
        </div>
        <div className="faq-list">
          {faq.map((item) => (
            <details className="faq-item" key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <nav className="next-up" aria-label="Continue reading">
        <Link className="next-up-card abbey" href="/research">
          <span className="eyeline abbey">Research</span>
          <strong>The publications and formal model behind these layers.</strong>
          <span>
            Open research <ArrowRight size={16} />
          </span>
        </Link>
        <Link className="next-up-card wdbx" href="/contact">
          <span className="eyeline wdbx">Contact</span>
          <strong>Most teams begin with a readiness audit.</strong>
          <span>
            Start a conversation <ArrowRight size={16} />
          </span>
        </Link>
      </nav>
    </div>
  );
}
