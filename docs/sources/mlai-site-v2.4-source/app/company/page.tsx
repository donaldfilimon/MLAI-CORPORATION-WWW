import type { Metadata } from "next";
import { company, founder, hiring, values, operatingPrinciples } from "@/lib/brand";
import { Section, Eyebrow, StatBlock, NextUp } from "@/components/ui";

export const metadata: Metadata = {
  title: "Company",
  description:
    "Machine Learning Advanced Innovations, Inc. — Delaware C-Corp, Orlando FL. Three binding principles: disciplined secrecy, mission stewardship, operational velocity.",
};

export default function CompanyPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-4 pt-20">
        <Eyebrow accent="abbey">{company.legalName}</Eyebrow>
        <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight text-white md:text-6xl">
          Small team. Systems languages. No ceremony.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-400">
          {company.entity}, {company.location}. We build the infrastructure layer for AI that runs
          where the data lives — and we publish the benchmarks to prove it.
        </p>
        <p className="mt-4 max-w-2xl font-mono text-[11px] leading-relaxed text-slate-600">
          {company.appleFraming}
        </p>
      </section>

      <Section eyebrow="Operating system" title="Three binding principles" accent="abbey">
        <div className="grid gap-px border border-line bg-line md:grid-cols-3">
          {company.principles.map((p, i) => (
            <div key={p.name} className="bg-panel p-6">
              <div className="font-mono text-xs uppercase tracking-[0.25em] text-abbey">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold text-white">{p.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Values"
        title="How we decide"
        accent="abbey"
        lead="Six values, and four operating principles stated as refusals — because a principle you can't violate isn't one."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="border border-line bg-panel p-5">
              <h3 className="font-display text-base font-semibold text-white">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{v.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 border border-line bg-panel">
          {operatingPrinciples.map((o, i) => (
            <div key={o} className={`flex gap-4 px-6 py-4 ${i > 0 ? "border-t border-line" : ""}`}>
              <span className="font-mono text-sm text-abbey">¬</span>
              <span className="font-mono text-sm text-slate-300">{o}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Founder" title={founder.name} accent="abbey" lead={founder.bio}>
        <div className="grid gap-4 md:grid-cols-3">
          {founder.stats.map((s) => (
            <StatBlock key={s.label} stat={s} accent="abbey" />
          ))}
        </div>
        <p className="mt-6 font-display text-lg text-white">
          &ldquo;{founder.motto}&rdquo;
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {founder.projects.map((pr) => (
            <div key={pr.name} className="border border-line bg-panel p-5">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-sm font-bold text-abbey">{pr.name}</span>
                <span className="font-mono text-[10px] text-slate-500">{pr.lang}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{pr.desc}</p>
              <p className="mt-3 truncate font-mono text-[10px] text-slate-600">{pr.url}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {founder.skills.map((sk) => (
            <span
              key={sk}
              className="border border-line bg-panel px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-slate-400"
            >
              {sk}
            </span>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Hiring"
        title="The first four hires"
        accent="abbey"
        lead="Pre-seed funds two of these immediately. If you read the architecture page and disagreed with a decision for a good reason, we should talk."
      >
        <div className="border border-line bg-panel">
          {hiring.map((h, i) => (
            <div
              key={h.role}
              className={`grid gap-1 px-6 py-4 md:grid-cols-[40px_260px_1fr] md:items-baseline ${
                i > 0 ? "border-t border-line" : ""
              }`}
            >
              <span className="font-mono text-sm text-abbey">{String(h.n).padStart(2, "0")}</span>
              <span className="text-sm font-semibold text-white">{h.role}</span>
              <span className="font-mono text-xs text-slate-500">{h.focus}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 border border-line bg-panel p-6">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
            Coverage
          </span>
          <div className="mt-3 flex flex-wrap gap-6 text-sm text-slate-400">
            {company.press.map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
        </div>
      </Section>
      <NextUp items={[
        { label: "Investors", href: "/investors", desc: "The round, the model, and where the funds go.", accent: "wdbx" },
        { label: "Research", href: "/research", desc: "The work behind the values.", accent: "abi" },
      ]} />
    </>
  );
}
