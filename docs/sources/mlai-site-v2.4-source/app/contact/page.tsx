import type { Metadata } from "next";
import { company } from "@/lib/brand";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach MLAI for enterprise pilots, developer access, hiring, or the investor data room.",
};

const channels = [
  {
    label: "Enterprise pilots",
    desc: "Healthcare, legal, finance — teams whose data can't leave the building. Pilot programs open Q2 2026.",
    action: "enterprise@mlai.dev",
  },
  {
    label: "Developers",
    desc: "WDBX core, ABI Framework, and the Swift SDK. Issues, benchmarks, and PRs welcome.",
    action: "github.com/donaldfilimon/abi · docs: donaldfilimon.github.io/abi",
  },
  {
    label: "Investors",
    desc: "Pre-seed data room: benchmark harness, codebase access, financial model, cap table.",
    action: "invest@mlai.dev",
  },
  {
    label: "Hiring",
    desc: "Swift, Zig, Metal, embeddings. If you argue well about memory layouts, write us.",
    action: "careers@mlai.dev",
  },
  {
    label: "Founder",
    desc: "Donald Filimon — systems architecture, partnerships, press.",
    action: "donaldfilimon.com · @donaldfilimonx",
  },
] as const;

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-20">
      <Eyebrow accent="wdbx">Contact</Eyebrow>
      <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight text-white md:text-6xl">
        Talk to the people who wrote the kernels.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-slate-400">
        No SDRs, no sequences. Mail goes to engineers.
      </p>

      <div className="mt-12 grid gap-px border border-line bg-line md:grid-cols-2">
        {channels.map((c) => (
          <div key={c.label} className="bg-panel p-7">
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-wdbx">{c.label}</div>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{c.desc}</p>
            <div className="mt-4 font-mono text-sm text-white">{c.action}</div>
          </div>
        ))}
      </div>

      <p className="mt-10 font-mono text-[11px] text-slate-600">
        {company.legalName} · {company.entity} · {company.location}
      </p>
    </section>
  );
}
