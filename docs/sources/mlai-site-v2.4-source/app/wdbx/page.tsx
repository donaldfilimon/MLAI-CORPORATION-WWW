import type { Metadata } from "next";
import { products } from "@/lib/brand";
import { Section, Eyebrow, StatBlock, FeatureCard, DataTable, ProvTag , NextUp } from "@/components/ui";
import { AccentGlow, IndexCard } from "@/components/HeroArt";
import { github } from "@/lib/brand";

export const metadata: Metadata = {
  title: "WDBX Vector Database",
  description:
    "Zig-built vector database with HNSW indexing, MVCC transactions, Metal/CUDA/Vulkan backends, and 32× quantization. 2.3ms p50, 98.2% Recall@10 — measured.",
};

export default function WDBXPage() {
  const p = products.wdbx;
  return (
    <>
      <section className="relative overflow-hidden">
        <AccentGlow accent="wdbx" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-4 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Eyebrow accent="wdbx">Storage layer · Zig 0.17-dev</Eyebrow>
            <h1 className="font-display text-5xl font-bold tracking-tight text-white md:text-6xl">
              {p.headline}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-400">{p.sub}</p>
          </div>
          <IndexCard />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 pt-10">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {p.heroStats.map((s) => (
              <StatBlock key={s.label} stat={s} accent="wdbx" />
            ))}
          </div>
        </div>
      </section>

      <Section eyebrow="Capabilities" title="What's inside" accent="wdbx">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {p.features.map((f) => (
            <FeatureCard key={f.title} accent="wdbx" title={f.title} desc={f.desc} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Benchmarks"
        title="Performance at scale"
        accent="wdbx"
        lead={p.scaleBench.note}
      >
        <div className="mb-3">
          <ProvTag tag={p.scaleBench.tag} />
        </div>
        <DataTable cols={p.scaleBench.cols} rows={p.scaleBench.rows} accent="wdbx" />
      </Section>

      <Section
        eyebrow="Competitive position"
        title="Against the field"
        accent="wdbx"
        lead="On-device beats round-trips. The latency advantage isn't an optimization — it's the absence of a network."
      >
        <DataTable cols={p.competitive.cols} rows={p.competitive.rows} accent="wdbx" highlightCol={1} />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {p.competitive.claims.map((c) => (
            <StatBlock key={c.label} stat={c} accent="wdbx" />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Open source"
        title="Apache-2.0, in the open"
        accent="wdbx"
        lead={github.description}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-5 md:grid-cols-2">
            {github.facets.map((f) => (
              <FeatureCard key={f.title} accent="wdbx" title={f.title} desc={f.desc} />
            ))}
          </div>
          <div className="border border-line bg-panel">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-abbey" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
                {github.repo}
              </span>
            </div>
            <div className="space-y-1 p-5 font-mono text-sm">
              {github.quickstart.map((line) => (
                <div key={line} className="text-slate-300">
                  <span className="text-wdbx">$ </span>
                  {line}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-px border-t border-line bg-line">
              {[
                ["License", github.license],
                ["Zig", github.zig.split("+")[0]],
                ["Commits", github.commits],
                ["Docs", github.docs],
              ].map(([k, v]) => (
                <div key={k} className="bg-panel px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">{k}</div>
                  <div className="mt-0.5 truncate font-mono text-xs text-white">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Concurrency model" title="MVCC, hash-chained" accent="wdbx">
        <div className="grid gap-6 md:grid-cols-2">
          <FeatureCard
            accent="wdbx"
            title="Non-blocking by construction"
            desc="Writes create new versions; readers see a consistent snapshot from transaction start. Inference-heavy read traffic and background ingestion never contend."
          />
          <FeatureCard
            accent="wdbx"
            title="Tamper-evident WAL"
            desc="The write-ahead log is hash-chained — SHA-256 over data XOR the prior block hash — so the audit trail is immutable without taxing the HNSW index hot path."
          />
        </div>
      </Section>
      <NextUp items={[
        { label: "ABI Framework", href: "/abi", desc: "The orchestration layer that runs on this index.", accent: "abi" },
        { label: "Platform", href: "/platform", desc: "Trace, control, evaluate, deploy — around all of it.", accent: "abi" },
      ]} />
    </>
  );
}
