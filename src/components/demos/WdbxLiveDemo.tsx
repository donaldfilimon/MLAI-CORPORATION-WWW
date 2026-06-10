import { useEffect, useMemo, useState } from "react";
import { CORPUS } from "@/lib/wdbx-demo-corpus";
import { WdbxEngine, type Block, type Hit, type QueryStats } from "@/lib/wdbx-demo";

const PRESETS = [
  "neural backtracking drift",
  "gpu acceleration apple silicon",
  "empathetic persona routing",
  "lock free concurrency snapshots",
  "encryption right to erasure",
];

/** The in-browser WDBX miniature: type a query, watch real cosine search over
 *  a hash-sharded corpus, with an MVCC snapshot counter and a hash-chained
 *  query log. Ported from the mlai-vite demo and restyled to the indigo system. */
export function WdbxLiveDemo() {
  const engine = useMemo(() => new WdbxEngine(CORPUS), []);
  const [query, setQuery] = useState(PRESETS[0] ?? "");
  const [hits, setHits] = useState<Hit[]>([]);
  const [stats, setStats] = useState<QueryStats | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);

  const run = (q: string) => {
    const text = q.trim();
    if (!text) return;
    const { hits: h, stats: s } = engine.search(text, 5);
    setHits(h);
    setStats(s);
    setBlocks([...engine.blocks].slice(-5));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => run(PRESETS[0] ?? ""), []);

  const topScore = hits.length ? Math.max(hits[0]?.score ?? 1e-6, 1e-6) : 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40 backdrop-blur-xl shadow-[0_4px_16px_0_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-indigo-400/70" aria-hidden="true" />
        <span className="ml-2 font-mono text-[11px] text-text-dim">
          wdbx · live query — in-browser miniature · {engine.size} vectors · ℝ^{stats?.dim ?? 256}
        </span>
      </div>

      <div className="p-5 md:p-6">
        {/* input row */}
        <div className="flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-bg/60 px-4 py-2.5 font-mono text-sm text-white placeholder:text-text-dim/50 outline-none focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-500/20"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run(query)}
            placeholder="semantic query — try: persona blending weights"
            spellCheck={false}
            aria-label="Semantic query"
          />
          <button
            type="button"
            onClick={() => run(query)}
            className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Query →
          </button>
        </div>

        {/* presets */}
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setQuery(p);
                run(p);
              }}
              className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] text-text-dim transition-colors hover:border-indigo-500/30 hover:text-indigo-300"
            >
              {p}
            </button>
          ))}
        </div>

        {/* results + stats */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_180px]">
          <div className="space-y-3">
            {hits.map((h) => (
              <div key={h.doc.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-sm font-bold text-white">{h.doc.title}</div>
                  <div className="font-mono text-xs text-indigo-300">{h.score.toFixed(4)}</div>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-text-dim">{h.doc.text}</p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                    style={{ width: `${Math.max(4, (h.score / topScore) * 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex gap-4 font-mono text-[10px] uppercase tracking-widest text-text-dim/50">
                  <span>shard {h.shard}</span>
                  <span>{h.doc.tag}</span>
                  <span>cosine</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:content-start">
            {[
              { v: stats ? stats.ms.toFixed(2) + "ms" : "—", k: "scan latency · measured" },
              { v: String(stats?.scanned ?? "—"), k: "vectors scanned" },
              { v: `${stats?.shardsHit ?? "—"}/4`, k: "shards hit" },
              { v: `#${stats?.snapshot ?? "—"}`, k: "mvcc snapshot" },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                <div className="font-mono text-lg font-bold text-white">{s.v}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-text-dim/50">{s.k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* block chain */}
        <div className="mt-6 border-t border-white/5 pt-5">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-dim/50">
            query block chain — each block hashes its parent
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {blocks.map((b, i) => (
              <span key={b.height} className="contents">
                {i > 0 && (
                  <span className="font-mono text-[10px] text-indigo-400/50" aria-hidden="true">
                    ─⛓─
                  </span>
                )}
                <span className="rounded-lg border border-indigo-500/15 bg-indigo-500/5 px-2.5 py-1.5">
                  <span className="block font-mono text-[10px] text-indigo-300">
                    #{b.height} · 0x{b.hash}
                  </span>
                  <span className="block max-w-[160px] truncate font-mono text-[10px] text-text-dim/60">
                    {b.query}
                  </span>
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
