import type { Metadata } from "next";
import Link from "next/link";
import { platform, corpStats, industries } from "@/lib/brand";
import { Section, Eyebrow, StatBlock , NextUp } from "@/components/ui";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "Four layers that make autonomy inspectable: Trace Layer, Control Plane, Evaluation Mesh, and Private Runtime. Cloud, VPC, on-premise, and offline-first.",
};

export default function PlatformPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-4 pt-20">
        <Eyebrow accent="abi">Neural AI orchestration</Eyebrow>
        <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight text-white md:text-6xl">
          Autonomy you can inspect.
        </h1>
        <p className="mt-5 max-w-3xl text-lg text-slate-400">{platform.intro}</p>
      </section>

      <Section eyebrow="Four layers" title="What the platform guarantees" accent="abi">
        <div className="grid gap-px border border-line bg-line md:grid-cols-2">
          {platform.layers.map((l, i) => (
            <div key={l.title} className="bg-panel p-7">
              <div className="font-mono text-xs uppercase tracking-[0.25em] text-abi">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold text-white">{l.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{l.desc}</p>
              <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-slate-500">
                {l.detail}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="In practice"
        title="What a trace actually looks like"
        accent="abi"
        lead="Abstract guarantees are cheap. This is the shape of the event stream the Trace Layer emits — every retrieval, policy decision, and human touch, replayable."
      >
        <div className="overflow-x-auto border border-line bg-panel p-5 font-mono text-[12px] leading-[1.7]">
          {[
            ["12:04:31.002", "retrieve", "q=#a41f k=10 hits=10 σ̄=0.91 chain=#8842…verified", "text-wdbx"],
            ["12:04:31.011", "policy  ", "tool:db.write requires approval → gate G-04 raised", "text-warn"],
            ["12:04:46.380", "operator", "j.alvarez approved G-04 · scope: single-row", "text-abbey"],
            ["12:04:46.402", "execute ", "db.write ok · wal block 670,115 appended · H verified", "text-wdbx"],
            ["12:04:46.405", "evaluate", "regression suite S-12 queued · faithfulness, injection", "text-abi"],
          ].map(([t, kind, msg, cls]) => (
            <div key={t} className="whitespace-nowrap">
              <span className="text-slate-600">{t}</span>{"  "}
              <span className={cls as string}>{kind}</span>{"  "}
              <span className="text-slate-400">{msg}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[11px] text-slate-600">
          Illustrative event shape; field names from the trace schema deliverable.
        </p>
      </Section>

      <Section
        eyebrow="Numbers"
        title="Targets stated as targets"
        accent="abi"
        lead="Per our operating principles: no benchmark without environment notes, workload shape, and reproducibility context. These are the platform's stated objectives, tagged."
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {corpStats.map((s) => (
            <StatBlock key={s.label} stat={s} accent="abi" />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Who it's for"
        title="Built for the teams that can't compromise"
        accent="abi"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {industries.map((ind) => (
            <div key={ind} className="border-l-2 border-abi/40 border-y border-r border-line bg-panel p-5 text-sm text-slate-300">
              {ind}
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/services"
            className="border border-abi bg-abi px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ink hover:opacity-85"
          >
            See engagements
          </Link>
          <Link
            href="/research"
            className="border border-line px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-slate-300 hover:border-slate-500 hover:text-white"
          >
            Read the research
          </Link>
        </div>
      </Section>
      <NextUp items={[
        { label: "Services", href: "/services", desc: "Nine engagements from audit to production.", accent: "abbey" },
        { label: "Research", href: "/research", desc: "The formal model and the publication index.", accent: "abi" },
      ]} />
    </>
  );
}
