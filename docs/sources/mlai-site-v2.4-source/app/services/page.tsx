import type { Metadata } from "next";
import Link from "next/link";
import { services, faq } from "@/lib/brand";
import { Section, Eyebrow, NextUp } from "@/components/ui";

export const metadata: Metadata = {
  title: "Services",
  description:
    "From autonomy readiness audits to private AI deployment: nine engagements that take teams from workflow mapping to production with measurable acceptance criteria.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-4 pt-20">
        <Eyebrow accent="abbey">Engagements</Eyebrow>
        <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight text-white md:text-6xl">
          Audit to production in 90 days.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-400">
          Every engagement ships named deliverables and measurable acceptance criteria — not a
          slide deck and a retainer.
        </p>
      </section>

      <Section
        eyebrow="Nine engagements"
        title="Assess. Build. Assure."
        accent="abbey"
        lead="Engagements group by where you are: deciding what's safe to automate, building it, then keeping it honest in production."
      >
        {(
          [
            { phase: "Assess", note: "Where the risk actually is", idx: [0, 7] },
            { phase: "Build", note: "Retrieval, orchestration, runtime, deployment", idx: [1, 2, 3, 5, 6] },
            { phase: "Assure", note: "Policy, evidence, regression gates", idx: [4, 8] },
          ] as const
        ).map((g) => (
          <div key={g.phase} className="mb-10 last:mb-0">
            <div className="mb-4 flex items-baseline gap-4">
              <h3 className="font-display text-xl font-semibold text-abbey">{g.phase}</h3>
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-slate-600">
                {g.note}
              </span>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {g.idx.map((i) => {
                const s = services[i];
                return (
                  <div key={s.title} className="flex flex-col border border-line bg-panel p-6">
                    <h4 className="font-display text-base font-semibold text-white">{s.title}</h4>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{s.desc}</p>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                      {s.outcomes.map((o) => (
                        <span
                          key={o}
                          className="border border-abbey/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-abbey"
                        >
                          {o}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </Section>

      <Section eyebrow="FAQ" title="Asked before every engagement" accent="abbey">
        <div className="border border-line bg-panel">
          {faq.map((f, i) => (
            <div key={f.q} className={`p-6 ${i > 0 ? "border-t border-line" : ""}`}>
              <h3 className="font-display text-base font-semibold text-white">{f.q}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">{f.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link
            href="/contact"
            className="border border-abbey bg-abbey px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ink hover:opacity-85"
          >
            Start with a readiness audit
          </Link>
        </div>
      </Section>
      <NextUp items={[
        { label: "Platform", href: "/platform", desc: "The four layers every engagement builds on.", accent: "abi" },
        { label: "Contact", href: "/contact", desc: "Start with a readiness audit.", accent: "abbey" },
      ]} />
    </>
  );
}
