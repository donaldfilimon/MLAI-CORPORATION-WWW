import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { figures } from "@/content/provenance";
import { ProvLegend, ProvTag } from "@/components/prov-tag";

/** Substrate rows only. Every one carries a source; see src/content/provenance.ts. */
const substrateFigures = figures.filter((f) => f.accent === "wdbx");

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
      {/* The ledger is the hero. Every other product page opens with a
          decorative panel; this page opens with the evidence, because the
          evidence is the product's actual argument. */}
      <section className="ledger-hero">
        <div className="ledger-hero-lede">
          <span className="eyeline wdbx">WDBX · Memory &amp; retrieval</span>
          <h1>Memory with a path you can follow.</h1>
          <p className="hero-description">
            Every value below is read from the line of the substrate that
            defines it, at a pinned commit. Where no harness exists yet, the
            value stays an em dash and the row stays a target.
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
        <div className="table-scroll ledger-hero-table">
          <table>
            <caption>
              WDBX substrate parameters, read from{" "}
              <code>crates/abi-wdbx/src/</code>.
            </caption>
            <thead>
              <tr>
                <th>Value</th>
                <th>What it is</th>
                <th>Provenance</th>
              </tr>
            </thead>
            <tbody>
              {substrateFigures.map((figure) => (
                <tr key={figure.id}>
                  <td>
                    <code>{figure.value}</code>
                  </td>
                  <td>
                    {figure.label}
                    {figure.note ? (
                      <span className="prov-legend-gloss">
                        {" "}
                        — {figure.note}
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <ProvTag tag={figure.tag} />
                    {figure.source.startsWith("https://") ? (
                      <>
                        {" "}
                        <a
                          href={figure.source}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          source
                        </a>
                      </>
                    ) : (
                      <span className="prov-legend-gloss">
                        {" "}
                        {figure.source}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ProvLegend variant="inline" className="prov-note" />
        </div>
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
