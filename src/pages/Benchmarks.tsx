import { Dashboard } from "../components/wdbx-benchmark/Dashboard";

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
      </div>
      <Dashboard />
    </div>
  );
}
