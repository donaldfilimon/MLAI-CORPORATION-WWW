import { Dashboard } from "../components/wdbx-benchmark/Dashboard";
import { CosineSimDemo } from "../components/demos/CosineSimDemo";
import { ShardingLatencyDemo } from "../components/demos/ShardingLatencyDemo";

// Architectural comparison — properties, not performance numbers. Each cell
// describes a design choice verifiable from the WDBX sources.
const ARCH_ROWS: [string, string, string, string][] = [
  ["Primary type", "Vectors (ℝᵈ)", "Rows / columns", "Documents"],
  ["Scaling model", "Vector-aware sharding", "Manual / replicas", "Hash auto-shard"],
  ["Concurrency", "Lock-free MVCC", "ACID locking", "Eventual (BASE)"],
  ["Integrity", "Hash-chained blocks", "WAL logs", "Replication logs"],
  ["Runtime", "Zig (no GC)", "C++ / Java (GC)", "Java / Go (GC)"],
];

export function Benchmarks() {
  return (
    <div className="w-full bg-bg min-h-screen pt-24">
      <div className="container-custom mb-12">
        <div className="label-chip mb-6">PERFORMANCE LAB</div>
        <h1 className="section-title">Benchmarks with operating context.</h1>
        <p className="section-subtitle max-w-3xl">
          Performance analytics for WDBX retrieval and agent orchestration,
          framed around latency budgets, throughput targets, GPU acceleration,
          and repeatable workloads.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            [
              "Repeatable",
              "Charts separate workload shape, hardware target, and runtime notes.",
            ],
            [
              "Operational",
              "Metrics are chosen for release decisions, not vanity dashboards.",
            ],
            [
              "Private-first",
              "Benchmark paths support local, VPC, and edge deployment constraints.",
            ],
          ].map(([title, body]) => (
            <div key={title} className="glass-card">
              <h2 className="font-bold text-white text-lg mb-2">{title}</h2>
              <p className="text-sm leading-relaxed text-text-dim">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <div className="label-chip mb-4">ARCHITECTURE, NOT ADJECTIVES</div>
          <h2 className="mb-3 font-display text-2xl font-bold text-white">
            How WDBX differs by construction
          </h2>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-text-dim">
            A comparison of design properties — each one a structural choice,
            not a performance claim.
          </p>
          <div className="glass-card overflow-x-auto p-0">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-text-dim">
                  <th className="px-5 py-3.5 font-medium">Property</th>
                  <th className="px-5 py-3.5 font-medium text-sky-300">WDBX</th>
                  <th className="px-5 py-3.5 font-medium">SQL</th>
                  <th className="px-5 py-3.5 font-medium">NoSQL</th>
                </tr>
              </thead>
              <tbody>
                {ARCH_ROWS.map(([prop, wdbx, sql, nosql]) => (
                  <tr key={prop} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3.5 font-medium text-white">{prop}</td>
                    <td className="px-5 py-3.5 text-sky-200">{wdbx}</td>
                    <td className="px-5 py-3.5 text-text-dim">{sql}</td>
                    <td className="px-5 py-3.5 text-text-dim">{nosql}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="label-chip mb-4">INTERACTIVE</div>
            <h2 className="mb-3 font-display text-xl font-bold text-white">
              Sharding latency model
            </h2>
            <ShardingLatencyDemo />
          </div>
          <div>
            <div className="label-chip mb-4">INTERACTIVE</div>
            <h2 className="mb-3 font-display text-xl font-bold text-white">
              Cosine similarity, felt
            </h2>
            <CosineSimDemo />
          </div>
        </div>
      </div>
      <Dashboard />
    </div>
  );
}
