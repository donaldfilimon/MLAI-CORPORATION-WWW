import type { Metadata } from "next";
import { research, researchTracks, wdbxModel } from "@/lib/brand";
import { PublicationIndex } from "@/components/PublicationIndex";
import { Section, Eyebrow, StatBlock, DataTable, ProvTag, ProvLegend, NextUp } from "@/components/ui";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Technical analyses of the WDBX architecture and the Abbey–Aviva–Abi multi-persona framework: sharding latency models, Universal Scalability Law, MVCC, Little's Law, and honest energy accounting.",
};

const briefs = [research.sharding, research.chaining, research.mvcc] as const;

export default function ResearchPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-4 pt-20">
        <Eyebrow accent="abi">Research briefs</Eyebrow>
        <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight text-white md:text-6xl">
          The math behind the milliseconds.
        </h1>
        <p className="mt-5 max-w-3xl text-lg text-slate-400">{research.intro}</p>
        <div className="mt-6">
          <ProvLegend />
        </div>
      </section>

      <Section eyebrow="Programs" title="Three research tracks" accent="abi">
        <div className="grid gap-px border border-line bg-line md:grid-cols-3">
          {researchTracks.map((t) => (
            <div key={t.name} className="bg-panel p-6">
              <h3 className="font-display text-lg font-semibold text-white">{t.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{t.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="The formal model"
        title="WDBX, stated precisely"
        accent="wdbx"
        lead={`From the June 2026 paper: "Every record carries provenance, every ranking decision decomposes into named factors, and every write lands in a hash-chained log that can be re-verified later. Where the design names a target it is labelled as such; none of the equations encode measured benchmark results." ${wdbxModel.naming}`}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="border border-line bg-panel p-6">
            <h3 className="font-display text-base font-semibold text-white">
              {wdbxModel.authority.title}
            </h3>
            <p className="mt-2 text-sm text-slate-400">{wdbxModel.authority.body}</p>
            <div className="mt-4 border-t border-line">
              {wdbxModel.authority.levels.map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-line/50 py-2 font-mono text-sm last:border-0">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-wdbx">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-line bg-panel p-6">
            <h3 className="font-display text-base font-semibold text-white">
              {wdbxModel.scoring.title}
            </h3>
            <div className="mt-3 border border-line bg-ink px-4 py-3 font-mono text-lg text-wdbx">
              {wdbxModel.scoring.formula}
            </div>
            <div className="mt-4 space-y-3">
              {wdbxModel.scoring.terms.map(([sym, desc]) => (
                <div key={sym} className="flex gap-3 text-sm">
                  <span className="font-mono text-wdbx">{sym}</span>
                  <span className="text-slate-400">{desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-line bg-panel p-6">
            <h3 className="font-display text-base font-semibold text-white">
              {wdbxModel.audit.title}
            </h3>
            <div className="mt-3 border border-line bg-ink px-4 py-3 font-mono text-sm text-wdbx">
              {wdbxModel.audit.formula}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{wdbxModel.audit.body}</p>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Publications"
        title="The publication index"
        accent="abi"
        lead="Eleven notes across the three tracks, September 2025 through June 2026."
      >
        <PublicationIndex />
      </Section>

      <Section eyebrow="WDBX internals" title="Architecture analyses" accent="abi">
        <div className="grid gap-6 md:grid-cols-3">
          {briefs.map((b) => (
            <article key={b.title} className="border border-line bg-panel p-6">
              <h3 className="font-display text-lg font-semibold text-white">{b.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{b.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Queueing theory"
        title={research.littlesLaw.title}
        accent="abi"
        lead={research.littlesLaw.body}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {research.littlesLaw.stats.map((s) => (
            <StatBlock key={s.label} stat={s} accent="abi" />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Comparative study"
        title={research.benchmarks.title}
        accent="abi"
        lead={research.benchmarks.note}
      >
        <div className="mb-3">
          <ProvTag tag="reported" />
        </div>
        <DataTable
          cols={["Metric", "Abbey+Aviva+Abi (WDBX)", "GPT-4", "Claude", "PaLM 2"]}
          rows={research.benchmarks.rows.map((r) => [r.metric, r.system, r.gpt4, r.claude, r.palm])}
          accent="abi"
          highlightCol={1}
        />
        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-slate-600">
          Comparative figures are from the cited study's documented test conditions, not
          independently reproduced by MLAI. They appear here for completeness; product pages carry
          only measured numbers.
        </p>
      </Section>

      <Section
        eyebrow="Energy"
        title={research.energy.title}
        accent="abbey"
        lead={research.energy.body}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {research.energy.stats.map((s) => (
            <StatBlock key={s.label} stat={s} accent="abbey" />
          ))}
        </div>
      </Section>

      <Section eyebrow="System map" title={research.infraTable.title} accent="abi">
        <div className="mb-3">
          <ProvTag tag="reported" />
        </div>
        <DataTable cols={research.infraTable.cols} rows={research.infraTable.rows} accent="abi" />
      </Section>
      <NextUp items={[
        { label: "WDBX", href: "/wdbx", desc: "The store these papers formalize.", accent: "wdbx" },
        { label: "Architecture", href: "/architecture", desc: "How the layers fit together in the runtime.", accent: "abi" },
      ]} />
    </>
  );
}
