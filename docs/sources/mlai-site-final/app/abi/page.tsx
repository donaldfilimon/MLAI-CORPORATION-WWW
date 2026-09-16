import type { Metadata } from "next";
import { products } from "@/lib/brand";
import { Section, Eyebrow, StatBlock, FeatureCard , NextUp } from "@/components/ui";
import { AccentGlow, ThroughputCard } from "@/components/HeroArt";
import { Prose, SplitSection, DeepDive, FAQList } from "@/components/content";
import { abiContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "ABI Framework",
  description:
    "ML and GPU acceleration framework for Apple Silicon: tensors, neural layers, zero-copy unified memory, and multi-persona orchestration in Zig 0.17-dev + Metal.",
};

export default function ABIPage() {
  const p = products.abi;
  return (
    <>
      <section className="relative overflow-hidden">
        <AccentGlow accent="abi" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-4 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Eyebrow accent="abi">Compute layer · Zig 0.17-dev + Metal</Eyebrow>
            <h1 className="font-display text-5xl font-bold tracking-tight text-white md:text-6xl">
              {p.headline}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-400">{p.sub}</p>
          </div>
          <ThroughputCard />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 pt-10">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {p.gpuBench.map((s) => (
              <StatBlock key={s.label} stat={s} accent="abi" />
            ))}
          </div>
          <p className="mt-3 font-mono text-[11px] text-slate-600">
            GPU speedups vs single-threaded CPU baseline on the same M-series device.
          </p>
        </div>
      </section>

      <Section eyebrow="Capabilities" title="What's inside" accent="abi">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {p.features.map((f) => (
            <FeatureCard key={f.title} accent="abi" title={f.title} desc={f.desc} />
          ))}
        </div>
      </Section>

      <Section eyebrow="How it works" title="The layer that spends the GPU" accent="abi">
        <Prose>
          {abiContent.intro.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </Prose>
      </Section>

      <SplitSection kicker="Unified memory" title="Zero-copy by construction, not optimization" accent="abi">
        {abiContent.unifiedMemory.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </SplitSection>
      <SplitSection kicker="Kernels" title="One source, lowered to the target ISA" accent="abi">
        {abiContent.kernels.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </SplitSection>

      <Section eyebrow="Inside the framework" title="What ABI gives you" accent="abi">
        <DeepDive items={abiContent.features} accent="abi" cols={2} />
      </Section>

      <Section
        eyebrow="Routing"
        title="One request, three roles"
        accent="abi"
        lead="Abi classifies intent and routes to the right persona; risky tool calls hit the policy gate before execution; outcomes feed the DQN reward loop. Planning, review, and execution never share unrestricted authority."
      >
        <div className="overflow-x-auto">
          <div className="flex min-w-[760px] items-stretch gap-0 font-mono text-[11px]">
            {(
              [
                ["intent", "classify", "text-slate-400"],
                ["abi", "route — adaptive", "text-abi"],
                ["abbey / aviva", "plan · respond", "text-abbey"],
                ["policy gate", "review · approve", "text-warn"],
                ["execute", "tools · WDBX RAG", "text-wdbx"],
                ["dqn loop", "reward · adapt", "text-abi"],
              ] as const
            ).map(([name, sub, color], i, arr) => (
              <div key={name} className="flex items-stretch">
                <div className="flex flex-col justify-center border border-line bg-panel px-4 py-3">
                  <span className={`font-semibold uppercase tracking-[0.1em] ${color}`}>{name}</span>
                  <span className="mt-0.5 text-[10px] text-slate-600">{sub}</span>
                </div>
                {i < arr.length - 1 && (
                  <span className="flex items-center px-2 text-slate-600" aria-hidden>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        eyebrow="The substrate"
        title="The Apple Silicon advantage"
        accent="abi"
        lead="Unified memory makes the host-to-device copy — the tax every CUDA pipeline pays — simply not exist. ABI's APIs are designed around that fact."
      >
        <div className="grid gap-px border border-line bg-line md:grid-cols-3">
          {p.silicon.map((s) => (
            <div key={s.label} className="bg-panel p-6">
              <div className="font-mono text-2xl font-bold text-abi">{s.value}</div>
              <div className="mt-1 text-sm text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 border border-line bg-panel p-6">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-abi">WDBX integration</span>
          <p className="mt-2 text-sm text-slate-400">
            ABI powers WDBX's GPU-accelerated distance calculations and embedding generation. One
            framework feeds the database and the personas above it.
          </p>
        </div>
      </Section>

      <Section
        eyebrow="Training pipeline"
        title="From kernels to models"
        accent="abi"
        lead="The same stack trains: a Zig 0.17-dev + MLX pipeline targeting a ~1B-parameter transformer runs end-to-end on Apple Silicon — data loading, tokenization, and the training loop, no cloud leg."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FeatureCard
            accent="abi"
            title="DQN reward loop"
            desc="Persona routing decisions feed a deep Q-network reward loop, so orchestration quality improves from production traffic without shipping data anywhere."
          />
          <FeatureCard
            accent="abi"
            title="Intent classification + RAG"
            desc="Queries are classified, routed, and grounded against WDBX retrieval before generation — surgical context instead of window-stuffing."
          />
        </div>
      </Section>
      <Section eyebrow="Questions" title="What people ask about ABI" accent="abi">
        <FAQList items={abiContent.faq} accent="abi" />
      </Section>

      <NextUp items={[
        { label: "Abbey", href: "/abbey", desc: "The assistant these personas power.", accent: "abbey" },
        { label: "Architecture", href: "/architecture", desc: "Five layers, one chip — how it stacks.", accent: "wdbx" },
      ]} />
    </>
  );
}
