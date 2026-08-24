import { CosineSimDemo } from "../components/demos/CosineSimDemo";
import { ShardingLatencyDemo } from "../components/demos/ShardingLatencyDemo";
import { CardPanel, DataTable, Eyebrow } from "@/components/site";

// Architectural comparison — properties, not performance numbers. Each cell
// describes a design choice verifiable from the WDBX sources.
const ARCH_COLS = ["Source-backed property", "WDBX implementation"] as const;
const ARCH_ROWS: [string, string][] = [
  ["Primary type", "Vectors (ℝᵈ)"],
  ["Index", "Layered HNSW; M=16, ef_construction=40, ef_search=32"],
  ["Concurrency", "MVCC transactions"],
  ["Integrity", "Hash-chained blocks"],
  ["Active runtime", "Rust"],
];

// How the benchmark surfaces are framed. Prose, not figures — no provenance
// tag applies because none of these is a measurement.
const FRAMING: readonly (readonly [string, string])[] = [
  [
    "Repeatable",
    "Figures state workload shape, hardware target, and where the number came from.",
  ],
  [
    "Operational",
    "Metrics are chosen for release decisions, not vanity dashboards.",
  ],
  [
    "Private-first",
    "Benchmark paths support local, VPC, and edge deployment constraints.",
  ],
];

export function Benchmarks() {
  return (
    <div className="w-full bg-bg min-h-screen pt-32 pb-20 relative overflow-hidden noise-overlay">
      <div className="container-custom relative z-10 mb-12">
        <Eyebrow className="mb-6">PERFORMANCE LAB</Eyebrow>
        <h1 className="section-title">Benchmarks with operating context.</h1>
        <p className="section-subtitle max-w-3xl">
          How WDBX retrieval and agent orchestration are built, with interactive
          models and source-backed properties. Performance figures stay
          unpublished until a reproducible harness and methodology exist.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* `CardPanel` rather than `FeatureCard` because these keep their
              <h2>: FeatureCard hardcodes <h3>, which would put an h3 ahead of
              the page's first real h2 ("How WDBX differs by construction"). */}
          {FRAMING.map(([title, body]) => (
            <CardPanel key={title} gap="sm">
              <h2 className="font-display text-lg font-semibold text-white">
                {title}
              </h2>
              <p className="text-sm leading-relaxed text-text-dim text-pretty">
                {body}
              </p>
            </CardPanel>
          ))}
        </div>

        <div className="mt-14">
          <Eyebrow className="mb-4">ARCHITECTURE, NOT ADJECTIVES</Eyebrow>
          <h2 className="mb-3 font-display text-2xl font-bold text-white">
            What the active WDBX substrate implements
          </h2>
          {/* The framing line is the table's <caption> rather than a paragraph
              above it — same words, now bound to the table it qualifies. */}
          <DataTable
            cols={ARCH_COLS}
            rows={ARCH_ROWS}
            highlightCol={1}
            caption="Properties verified against the active sibling Rust substrate; these are structural facts, not performance figures."
          />
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <div>
            <Eyebrow className="mb-4">INTERACTIVE</Eyebrow>
            <h2 className="mb-3 font-display text-xl font-bold text-white">
              Parallel retrieval model
            </h2>
            <ShardingLatencyDemo />
          </div>
          <div>
            <Eyebrow className="mb-4">INTERACTIVE</Eyebrow>
            <h2 className="mb-3 font-display text-xl font-bold text-white">
              Cosine similarity, felt
            </h2>
            <CosineSimDemo />
          </div>
        </div>
      </div>
    </div>
  );
}
