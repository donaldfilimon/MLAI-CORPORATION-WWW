import type { Metadata } from "next";
import { products } from "@/lib/brand";
import {
  Section,
  Eyebrow,
  StatBlock,
  FeatureCard,
  accentText,
  accentBorder,
  NextUp,
} from "@/components/ui";
import { AccentGlow, PersonaCard } from "@/components/HeroArt";

export const metadata: Metadata = {
  title: "Abbey AI Assistant",
  description:
    "Self-learning, emotionally aware AI assistant with persistent vector-backed memory. Discord-native today; Swift 6 / Vapor 4 port in progress.",
};

export default function AbbeyPage() {
  const p = products.abbey;
  return (
    <>
      <section className="relative overflow-hidden">
        <AccentGlow accent="abbey" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-4 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Eyebrow accent="abbey">Application layer · Bun + TypeScript → Swift 6</Eyebrow>
            <h1 className="font-display text-5xl font-bold tracking-tight text-white md:text-6xl">
              {p.headline}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-400">{p.sub}</p>
          </div>
          <PersonaCard />
        </div>
      </section>

      <Section eyebrow="Capabilities" title="What Abbey does" accent="abbey">
        <div className="grid gap-5 md:grid-cols-2">
          {p.capabilities.map((f) => (
            <FeatureCard key={f.title} accent="abbey" title={f.title} desc={f.desc} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Multi-persona architecture"
        title="Three minds, one router"
        accent="abbey"
        lead="A single model can't optimize for empathy and terseness simultaneously — the objectives fight inside one set of weights. So we don't make it."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {p.personas.map((per) => (
            <div
              key={per.name}
              className={`border-t-2 ${accentBorder[per.accent]} border-x border-b border-line bg-panel p-6`}
            >
              <div className={`font-display text-xl font-semibold ${accentText[per.accent]}`}>
                {per.name}
              </div>
              <div className="mt-0.5 font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
                {per.role}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{per.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {p.personaStats.map((s) => (
            <StatBlock key={s.label} stat={s} accent="abbey" />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Platform status"
        title="Where Abbey runs"
        accent="abbey"
        lead="Shipping where the communities are first; the native port follows."
      >
        <div className="border border-line bg-panel">
          {p.platformStatus.map((row, i) => (
            <div
              key={row.name}
              className={`flex items-center justify-between px-6 py-4 ${i > 0 ? "border-t border-line" : ""}`}
            >
              <span className="text-sm text-slate-300">{row.name}</span>
              <span
                className={`font-mono text-[11px] uppercase tracking-[0.2em] ${
                  row.status === "Shipping" ? "text-abbey" : "text-warn"
                }`}
              >
                {row.status === "Shipping" ? "● shipping" : "○ in progress"}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-8 border border-line bg-panel p-6">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-abbey">Memory model</span>
          <p className="mt-2 text-sm text-slate-400">
            Every conversation Abbey remembers is a vector in WDBX on hardware you control. Forgetting
            is a delete, not a support ticket.
          </p>
        </div>
      </Section>
      <NextUp items={[
        { label: "Platform", href: "/platform", desc: "The guarantees wrapped around every persona action.", accent: "abi" },
        { label: "Services", href: "/services", desc: "Assess, build, assure — with named deliverables.", accent: "abbey" },
      ]} />
    </>
  );
}
