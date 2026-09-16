import type { Metadata } from "next";
import { architecture } from "@/lib/brand";
import { Section, Eyebrow, FeatureCard, NextUp } from "@/components/ui";
import { Prose, StepList, DeepDive } from "@/components/content";
import { architectureContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Architecture",
  description:
    "Pure-Zig full-stack web server for WDBX: std.http vs http.zig vs Jetzig vs zzz, SIMD @Vector kernels, comptime SSR, and single-command cross-compilation.",
};

export default function ArchitecturePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-4 pt-20">
        <Eyebrow accent="wdbx">Engineering notes · Zig 0.17-dev</Eyebrow>
        <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight text-white md:text-6xl">
          The database serves itself.
        </h1>
        <p className="mt-5 max-w-3xl text-lg text-slate-400">{architecture.intro}</p>
      </section>

      <Section
        eyebrow="The stack"
        title="Five layers, one chip"
        accent="wdbx"
        lead="Everything from persona routing to distance kernels resolves on the same silicon. The trace layer spans the full height — every layer emits inspectable events."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
          <div className="flex flex-col gap-2">
            {(
              [
                ["Abbey", "Assistant surface — persistent memory, emotional context, Discord-native today", "border-abbey/50", "text-abbey", "L5"],
                ["ABI Framework", "Orchestration — intent classification, Abbey/Aviva/Abi persona routing, DQN reward loop", "border-abi/50", "text-abi", "L4"],
                ["WDBX", "Storage — HNSW index, MVCC transactions, quantization, hash-chained WAL", "border-wdbx/50", "text-wdbx", "L3"],
                ["Metal · Accelerate · Core ML", "Apple's public frameworks — GPU distance kernels, SIMD, on-device inference", "border-line", "text-slate-400", "L2"],
                ["Apple Silicon", "Unified memory — the index, the inference, and the data share one address space", "border-line", "text-slate-400", "L1"],
              ] as const
            ).map(([name, desc, border, color, layer]) => (
              <div key={name} className={`flex items-baseline gap-5 border ${border} bg-panel px-6 py-4`}>
                <span className="font-mono text-[10px] text-slate-600">{layer}</span>
                <div>
                  <span className={`font-display text-base font-semibold ${color}`}>{name}</span>
                  <span className="ml-3 text-sm text-slate-500">{desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden flex-col border border-dashed border-line bg-panel/50 px-4 py-4 lg:flex">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Trace layer
            </span>
            <div className="mt-2 flex-1 border-l border-dashed border-line pl-4 font-mono text-[11px] leading-[1.8] text-slate-600">
              persona.route
              <br />
              policy.gate
              <br />
              wdbx.query
              <br />
              gpu.dispatch
              <br />
              wal.append
            </div>
            <span className="font-mono text-[10px] text-slate-600">spans L1–L5 · /platform</span>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="HTTP layer"
        title="Framework selection, measured"
        accent="wdbx"
        lead="Throughput figures from community benchmarks on Apple M-series hardware. The standard library is the floor; the question is how much ceiling the workload needs."
      >
        <div className="border border-line bg-panel">
          {architecture.serverOptions.map((o, i) => (
            <div
              key={o.name}
              className={`grid gap-2 px-6 py-5 md:grid-cols-[180px_140px_1fr] md:items-baseline ${
                i > 0 ? "border-t border-line" : ""
              }`}
            >
              <span className="font-mono text-sm font-semibold text-white">{o.name}</span>
              <span className="font-mono text-sm text-wdbx">{o.perf}</span>
              <span className="text-sm text-slate-400">{o.note}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Minimal server" title="Zig 0.17-dev, post-Writergate" accent="wdbx">
        <pre className="overflow-x-auto border border-line bg-panel p-6 font-mono text-[13px] leading-relaxed text-slate-300">
          <code>{architecture.codeSample}</code>
        </pre>
        <p className="mt-3 font-mono text-[11px] text-slate-600">
          std.http.Server over the new std.Io.Reader / std.Io.Writer interfaces introduced in the
          0.15→0.16 transition.
        </p>
      </Section>

      <Section eyebrow="Decisions" title="Four calls that shaped the stack" accent="wdbx">
        <div className="grid gap-6 md:grid-cols-2">
          {architecture.decisions.map((d) => (
            <FeatureCard key={d.title} accent="wdbx" title={d.title} desc={d.body} />
          ))}
        </div>
      </Section>
      <Section eyebrow="The whole stack" title="One sentence, bottom to top" accent="abi">
        <Prose>
          {architectureContent.intro.map((para, i) => (<p key={i}>{para}</p>))}
        </Prose>
        <div className="mt-8">
          <StepList steps={architectureContent.flow} accent="abi" />
        </div>
      </Section>

      <Section eyebrow="Why it's built this way" title="The design choices behind the stack" accent="abi">
        <DeepDive items={architectureContent.designChoices} accent="abi" cols={2} />
      </Section>

      <NextUp items={[
        { label: "WDBX", href: "/wdbx", desc: "The storage layer in depth.", accent: "wdbx" },
        { label: "Research", href: "/research", desc: "The formal model and the publication index.", accent: "abi" },
      ]} />
    </>
  );
}
