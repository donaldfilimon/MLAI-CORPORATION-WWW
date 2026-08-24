import { useState } from "react";

// Interactive latency MODEL: L = α + βS/n — fixed overhead plus a scan term
// that parallelizes across partitions. Parameters are illustrative, not
// measured production numbers.
//
// The "model, not product" framing must stay VISIBLE, not just live in this
// comment. On /benchmarks this renders roughly 200px below an architecture
// Distributed sharding is forbidden as a WDBX claim: cluster_rpc.rs explicitly
// says its transport is not sharding. This remains a general partition model.
export function ShardingLatencyDemo() {
  const [n, setN] = useState(8);
  const alpha = 12;
  const betaS = 768;
  const L = alpha + betaS / n;
  const bars = [1, 2, 4, 8, 16, 32];

  return (
    <div className="glass-card p-6">
      <div className="mb-1 flex items-end justify-between">
        <div>
          <div className="text-4xl font-black text-sky-400">
            {L.toFixed(0)}
            <span className="text-lg text-text-dim"> ms</span>
          </div>
          <div className="text-xs text-text-dim">modeled retrieval latency (illustrative parameters)</div>
        </div>
        <span className="label-chip">{n} partitions (modeled)</span>
      </div>
      <div className="my-4 rounded-lg bg-black/30 px-3 py-2 font-mono text-xs text-sky-300/80">
        L(n) = {alpha} + {betaS}/{n} = {L.toFixed(1)} ms
      </div>
      <input
        type="range" min={1} max={32} value={n}
        onChange={(e) => setN(+e.target.value)}
        className="w-full accent-sky-400"
      />
      <div className="mt-4 flex h-24 items-end gap-2">
        {bars.map((b) => {
          const v = alpha + betaS / b;
          const pct = (v / (alpha + betaS)) * 100;
          return (
            <button key={b} onClick={() => setN(b)} className="group flex flex-1 flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-md transition-all ${b === n ? "bg-linear-to-t from-sky-600 to-sky-300" : "bg-white/15 group-hover:bg-white/25"}`}
                style={{ height: `${pct}%` }}
              />
              <span className={`text-[10px] ${b === n ? "text-sky-400" : "text-text-dim/60"}`}>{b}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-text-dim">
        Splitting a scan across more partitions drives latency toward the fixed
        overhead α — the shape of that curve is the point, and the constants are
        illustrative rather than benchmark results.{" "}
        <strong className="text-text-dim/90">
          This models how partitioned retrieval scales in general, not a WDBX
          feature; the active cluster RPC source explicitly disclaims sharding.
        </strong>
      </p>
    </div>
  );
}
