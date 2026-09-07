import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArchitectureDiagram } from "@/components/architecture";
import { figures } from "@/content/provenance";
import { ProvLegend, ProvTag } from "@/components/prov-tag";
import { pages } from "@/content/pages";

/**
 * The four-layer substrate view.
 *
 * Every technical statement below was read from the sibling repositories on
 * 2026-09-07 rather than carried over from a design handoff:
 *   Rust, not Zig — abi and wdbx are Cargo workspaces.
 *   The Metal path is conditional, not live — see the ABI layer's own note.
 *   The WDBX numbers are not restated here; they render from
 *   src/content/provenance.ts so there is exactly one source of truth.
 */
const layers = [
  {
    n: "01",
    name: "Silicon",
    role: "Hardware substrate",
    accent: "",
    detail:
      "Apple Silicon · unified memory · Neural Engine reached through Core ML.",
    why: "CPU and GPU share one address space, so a tensor written by one is readable by the other without a transfer. This is a property of the hardware, not of our software — everything above is designed to spend it.",
  },
  {
    n: "02",
    name: "ABI",
    role: "Runtime and compute",
    accent: "abi",
    detail:
      "Rust workspace · tensors · optional Metal DOT kernels · CPU SIMD fallback.",
    why: "Built around unified memory rather than around a host/device split it would have to hide. The GPU path is deliberately conditional: the Metal kernels are a compile-time feature and dispatch only once the native dylib initializes a device — otherwise the runtime reports accelerated=false and takes the CPU path. A green runtime is not a claim that a kernel ran.",
  },
  {
    n: "03",
    name: "WDBX",
    role: "Memory and retrieval",
    accent: "wdbx",
    detail:
      "Rust substrate · layered HNSW · snapshot iteration · hash-chained write-ahead log.",
    why: "In-process and single-node by design, because the thesis is that inference, index and data share a chip; distribution would reintroduce the hop the design exists to remove. Integrity lives at the log, so tamper-evidence costs nothing on the read path. Its parameters are below, each linked to the line that defines it.",
  },
  {
    n: "04",
    name: "Abbey",
    role: "Assistant layer",
    accent: "abbey",
    detail: "Personas · deterministic routing · local memory.",
    why: "The stack pointed at a person. Recall is a vector search against the same store the rest of the stack uses, so memory is not a second service to keep in sync.",
  },
] as const;

const substrateFigures = figures.filter((f) => f.accent === "wdbx");
const runtimeFigures = figures.filter((f) => f.accent === "abi");
const article = pages.architecture;

export function ArchitecturePage() {
  return (
    <div className="public-container marketing-page">
      <section className="marketing-hero">
        <div>
          <span className="eyeline wdbx">Architecture</span>
          <h1>{article?.title}</h1>
          <p className="hero-description">{article?.description}</p>
          <div className="button-row">
            <Link className="button primary" href="/docs">
              Read the documentation <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" href="/processing">
              Processing and privacy
            </Link>
          </div>
        </div>
        <aside className="callout-card abi integrity-callout">
          <strong>What this page will not do</strong>
          <p>
            No throughput, latency or speedup figure appears here. None has a
            published harness, so none is a result. Where a number is real it is
            a parameter read from source, and it links to the line that defines
            it.
          </p>
        </aside>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline wdbx">The stack</span>
          <h2>Four layers, and why each one exists.</h2>
          <p className="muted">
            The bottom layer is hardware we did not build. The other three are
            the engineering that makes its advantage usable without giving
            anything up.
          </p>
        </div>
        <ol className="step-list">
          {layers.map((layer) => (
            <li key={layer.n}>
              <span className="step-index">{layer.n}</span>
              <div>
                <strong>
                  {layer.name}
                  <span className={`eyeline ${layer.accent}`}>
                    {layer.role}
                  </span>
                </strong>
                <p>{layer.detail}</p>
                <p className="muted">{layer.why}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline wdbx">Parameters</span>
          <h2>Every number on this page has a line number.</h2>
        </div>
        <div className="table-scroll">
          <table>
            <caption>
              Substrate and runtime parameters, read from the sibling Rust
              repositories at a pinned commit.
            </caption>
            <thead>
              <tr>
                <th>Layer</th>
                <th>Value</th>
                <th>What it is</th>
                <th>Provenance</th>
              </tr>
            </thead>
            <tbody>
              {[...substrateFigures, ...runtimeFigures].map((figure) => (
                <tr key={figure.id}>
                  <td>
                    <span className={`eyeline ${figure.accent ?? ""}`}>
                      {figure.accent === "abi" ? "ABI" : "WDBX"}
                    </span>
                  </td>
                  <td>
                    <code>{figure.value}</code>
                  </td>
                  <td>{figure.label}</td>
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
        </div>
        <ProvLegend variant="inline" className="prov-note" />
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abbey">In one process</span>
          <h2>Where a request actually goes.</h2>
          <p className="muted">
            Assistant, runtime and memory sit in one address space. There is no
            serialization boundary between the index and the model.
          </p>
        </div>
        <ArchitectureDiagram />
      </section>

      {article?.sections.map((section, i) => (
        <section
          className="split-section wdbx"
          id={`section-${i}`}
          key={section.title}
        >
          <div>
            <span className="eyeline wdbx">
              Stage {String(i + 1).padStart(2, "0")}
            </span>
            <h2>{section.title}</h2>
          </div>
          <div>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      <nav className="next-up" aria-label="Continue reading">
        <Link className="next-up-card wdbx" href="/wdbx">
          <span className="eyeline wdbx">WDBX</span>
          <strong>The substrate these parameters belong to.</strong>
          <span>
            View WDBX <ArrowRight size={16} />
          </span>
        </Link>
        <Link className="next-up-card abi" href="/abi">
          <span className="eyeline abi">ABI</span>
          <strong>The runtime, and what its green states mean.</strong>
          <span>
            View ABI <ArrowRight size={16} />
          </span>
        </Link>
      </nav>
    </div>
  );
}
