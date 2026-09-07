import Link from "next/link";
import { ArrowRight } from "lucide-react";

const capabilities = [
  {
    title: "Runtime diagnostics you can quote",
    desc: "ABI exposes scheduler state, capability reports, and backend snapshots through its CLI. The developer console shows actual responses from a configured executable.",
  },
  {
    title: "Distinct readiness states",
    desc: "Linked features, native acceleration, and fallback behavior are separate states. A configured backend is not proof that a particular model or accelerator is ready.",
  },
  {
    title: "Bounded local console",
    desc: "The local console permits a diagnostic snapshot and backend report. It does not expose a shell or accept arbitrary command arguments.",
  },
  {
    title: "Orchestration without silent swaps",
    desc: "Model connections and tool capabilities stay explicit. Broader runtime commands remain documented in the ABI repository — this site does not treat every CLI flag as an application feature.",
  },
] as const;

const pipeline = [
  {
    step: "01",
    title: "Configure",
    body: "Point the workspace at an ABI executable and authenticated backends you control.",
  },
  {
    step: "02",
    title: "Inspect",
    body: "Pull a capability report and scheduler snapshot before trusting a path for production work.",
  },
  {
    step: "03",
    title: "Execute",
    body: "Run bounded operations through explicit interfaces — no free-form shell, no silent provider failover.",
  },
  {
    step: "04",
    title: "Escalate",
    body: "When policy or confidence fails, operators get an intervention point instead of an unbounded retry.",
  },
] as const;

export function AbiPage() {
  return (
    <div className="public-container marketing-page">
      <section className="marketing-hero">
        <div>
          <span className="eyeline abi">ABI · Runtime & orchestration</span>
          <h1>Compute you can interrogate.</h1>
          <p className="hero-description">
            A Rust runtime for agent orchestration, model connections, and
            inspectable capabilities. What it can prove is visible; what it
            cannot prove stays labeled incomplete.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/docs/abi">
              Connect ABI <ArrowRight size={18} />
            </Link>
            <Link
              className="button secondary"
              href="https://github.com/donaldfilimon/abi"
              target="_blank"
              rel="noopener noreferrer"
            >
              ABI repository
            </Link>
          </div>
        </div>
        <aside className="callout-card abi integrity-callout">
          <strong>Integrity note</strong>
          <p>
            Linked features and accelerators are reported as distinct states. A
            green path in the console means the configured executable answered —
            not that every optional capability is present.
          </p>
        </aside>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abi">Capabilities</span>
          <h2>Start with what the runtime can prove.</h2>
        </div>
        <div className="feature-grid">
          {capabilities.map((item) => (
            <article className="feature-card abi" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abi">Pipeline</span>
          <h2>Configure → inspect → execute → escalate.</h2>
        </div>
        <ol className="step-list">
          {pipeline.map((item) => (
            <li key={item.step}>
              <span className="step-index">{item.step}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <nav className="next-up" aria-label="Continue reading">
        <Link className="next-up-card wdbx" href="/wdbx">
          <span className="eyeline wdbx">WDBX</span>
          <strong>Memory and retrieval behind the same inspectable stack.</strong>
          <span>
            View WDBX <ArrowRight size={16} />
          </span>
        </Link>
        <Link className="next-up-card abbey" href="/platform">
          <span className="eyeline abi">Platform</span>
          <strong>How ABI sits inside the four control layers.</strong>
          <span>
            View platform <ArrowRight size={16} />
          </span>
        </Link>
      </nav>
    </div>
  );
}
