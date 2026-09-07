import Link from "next/link";
import { ArrowRight } from "lucide-react";

const features = [
  {
    title: "Query a real store",
    desc: "The ABI WDBX gateway exposes vector insertion and search, key/value operations, statistics, and mutation events through an authenticated gRPC interface.",
  },
  {
    title: "Failures stay visible",
    desc: "Playground results come from the selected gateway. The interface reports disconnected services and failed requests directly — no silent empty success.",
  },
  {
    title: "Workspace-bound gateway",
    desc: "A gateway binding belongs to one application workspace. The current gateway has no tenant field, so different customer workspaces cannot share one bound store.",
  },
  {
    title: "Separate document index",
    desc: "The application's document index is separate. It owns document deletion, source references, and semantic model versions; gateway playground data has its own lifecycle.",
  },
] as const;

export function WdbxPage() {
  return (
    <div className="public-container marketing-page">
      <section className="marketing-hero">
        <div>
          <span className="eyeline wdbx">WDBX · Memory & retrieval</span>
          <h1>Memory with a path you can follow.</h1>
          <p className="hero-description">
            Memory and retrieval infrastructure with inspectable storage and
            explicit interfaces. Context stays as weighted paths — so you can
            ask which sources were used and where confidence dropped.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/docs/wdbx">
              Gateway integration <ArrowRight size={18} />
            </Link>
            <Link
              className="button secondary"
              href="https://github.com/donaldfilimon/wdbx"
              target="_blank"
              rel="noopener noreferrer"
            >
              WDBX repository
            </Link>
          </div>
        </div>
        <aside className="trace-panel" aria-label="Retrieval shape">
          <div className="trace-panel-label" style={{ color: "var(--accent-wdbx)" }}>
            retrieve ❯
          </div>
          <pre>{`hnsw · k pinned · sources attached
weight path · confidence labeled
mutation event · workspace scoped

illustrative shape — not a benchmark`}</pre>
        </aside>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline wdbx">Surface</span>
          <h2>Interfaces that report the truth.</h2>
        </div>
        <div className="feature-grid">
          {features.map((item) => (
            <article className="feature-card wdbx" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="split-section wdbx">
        <div>
          <span className="eyeline wdbx">Isolation</span>
          <h2>The boundary is concrete.</h2>
        </div>
        <div>
          <p>
            Gateway playground data and the application document index do not
            share a lifecycle. Deleting a source in the workspace does not imply
            a matching playground mutation — and the UI keeps those stories
            separate.
          </p>
          <p>
            Because bindings are workspace-scoped, operators can reason about
            who can retrieve what without inventing a multi-tenant field the
            gateway does not have.
          </p>
        </div>
      </section>

      <nav className="next-up" aria-label="Continue reading">
        <Link className="next-up-card abi" href="/abi">
          <span className="eyeline abi">ABI</span>
          <strong>The runtime that opens the gateway.</strong>
          <span>
            View ABI <ArrowRight size={16} />
          </span>
        </Link>
        <Link className="next-up-card abbey" href="/abbey">
          <span className="eyeline abbey">IWL</span>
          <strong>The assistant whose memory lives here.</strong>
          <span>
            View IWL <ArrowRight size={16} />
          </span>
        </Link>
      </nav>
    </div>
  );
}
