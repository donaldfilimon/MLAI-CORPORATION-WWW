import type { Metadata } from "next";
import Link from "next/link";
import { investors, founder } from "@/lib/brand";
import { Section, Eyebrow, StatBlock, ProvTag, accentText, accentBg, NextUp } from "@/components/ui";

export const metadata: Metadata = {
  title: "Investors",
  description:
    "$1.5M pre-seed. 18-month runway to Series A. Open-core monetization against the $2.88B vector database market on 200M+ Apple Silicon devices.",
};

const maxArr = 45;

export default function InvestorsPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-4 pt-20">
        <Eyebrow accent="wdbx">
          {investors.raise.stage} · {investors.raise.date}
        </Eyebrow>
        <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight text-white md:text-6xl">
          {investors.raise.amount} to own the on-device layer.
        </h1>
        <p className="mt-5 max-w-3xl text-lg text-slate-400">{investors.thesis}</p>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
          {investors.raise.runway}
        </p>
      </section>

      <Section eyebrow="Market" title="The numbers underneath" accent="wdbx">
        <div className="space-y-5">
          {[investors.market.tam, investors.market.sam, investors.market.som].map((m) => (
            <div key={m.label}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">
                  {m.label}
                </span>
                <span className="text-xs text-slate-600">{m.desc}</span>
              </div>
              <div className="h-9 border border-line bg-panel" style={{ width: `${m.width}%` }}>
                <div className="flex h-full items-center bg-gradient-to-r from-wdbx/25 to-transparent px-4">
                  <span className="font-mono text-sm font-bold text-white">{m.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-px border border-line bg-line md:grid-cols-3">
          {investors.market.growth.map((g) => (
            <div key={g.label} className="bg-panel p-5 text-center">
              <div className="font-mono text-2xl font-bold text-wdbx">{g.value}</div>
              <div className="mt-1 text-xs text-slate-500">{g.label}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Why now"
        title="Five converging trends"
        accent="abi"
        lead="We saw this with iOS apps in 2008. We're seeing it again with on-device AI in 2026 — native-first builders capture the platform shift."
      >
        <div className="space-y-3">
          {investors.whyNow.map((t, i) => (
            <div key={t.title} className="grid gap-2 border border-line bg-panel p-5 md:grid-cols-[44px_180px_220px_1fr] md:items-baseline">
              <span className="font-mono text-sm text-slate-600">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-mono text-base font-bold text-abi">{t.metric}</span>
              <span className="text-sm font-semibold text-white">{t.title}</span>
              <span className="text-sm leading-relaxed text-slate-400">{t.desc}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Business model"
        title="Open core, enterprise top"
        accent="abbey"
        lead="The model that built GitLab, MongoDB, and Elastic: free core drives adoption; clustering, compliance, and managed hosting drive revenue."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {investors.pricing.map((t) => (
            <div key={t.tier} className="border border-line bg-panel p-5">
              <div className="font-display text-base font-semibold text-white">{t.tier}</div>
              <div className="mt-1 font-mono text-xl font-bold text-abbey">{t.price}</div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">{t.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {investors.unitTargets.map((s) => (
            <StatBlock key={s.label} stat={s} accent="abbey" />
          ))}
        </div>
      </Section>

      <Section eyebrow="Use of funds" title={`Deploying the ${investors.raise.amount}`} accent="wdbx">
        <div className="space-y-5">
          {investors.useOfFunds.map((u) => (
            <div key={u.bucket}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-white">
                  {u.bucket}{" "}
                  <span className="font-mono text-xs text-slate-500">({u.pct}%)</span>
                </span>
                <span className="font-mono text-sm text-wdbx">{u.amount}</span>
              </div>
              <div className="h-2 bg-panel">
                <div className="h-full bg-wdbx/60" style={{ width: `${u.pct}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">{u.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
            18-month milestones <span className="ml-2"><ProvTag tag="target" /></span>
          </div>
          <div className="grid gap-px border border-line bg-line md:grid-cols-4">
            {investors.milestones18mo.map((m) => (
              <div key={m.metric} className="bg-panel p-5 text-center">
                <div className="font-mono text-xl font-bold text-white">{m.target}</div>
                <div className="mt-1 text-xs text-slate-500">{m.metric}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section eyebrow="Roadmap" title="Foundation → Growth → Scale → Expand" accent="abi">
        <div className="grid gap-5 md:grid-cols-4">
          {investors.roadmap.map((r) => (
            <div key={r.phase} className="border border-line bg-panel p-5">
              <div className="flex items-center justify-between">
                <span className={`font-mono text-xs uppercase tracking-[0.2em] ${accentText[r.accent]}`}>
                  {r.phase}
                </span>
                {r.state === "current" ? (
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-abbey">
                    ● now
                  </span>
                ) : null}
              </div>
              <div className="mt-2 font-display text-lg font-semibold text-white">{r.name}</div>
              <ul className="mt-3 space-y-1.5">
                {r.items.map((it) => (
                  <li key={it} className="flex gap-2 text-xs text-slate-400">
                    <span className={`mt-1 h-1 w-1 flex-shrink-0 rounded-full ${accentBg[r.accent]}`} />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Projections"
        title="ARR trajectory"
        accent="wdbx"
        lead="Five-year plan, open-core conversion assumptions documented in the data room."
      >
        <div className="mb-3">
          <ProvTag tag="target" />
        </div>
        <div className="flex items-end justify-between gap-3 border border-line bg-panel p-6 md:gap-6 md:p-10">
          {investors.arr.map((d) => (
            <div key={d.year} className="flex flex-1 flex-col items-center gap-2">
              <span className="font-mono text-xs font-bold text-wdbx md:text-sm">${d.value}M</span>
              <div className="flex h-40 w-full items-end md:h-52">
                <div
                  className="w-full bg-gradient-to-t from-wdbx/50 to-wdbx/15"
                  style={{ height: `${Math.max((d.value / maxArr) * 100, 3)}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-slate-500">{d.year}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section accent="wdbx">
        <div className="border border-line bg-panel p-10 text-center md:p-14">
          <h2 className="font-display text-3xl font-semibold text-white">
            Diligence starts with the benchmarks.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            {founder.name} will walk you through the harness, the codebase, and the data room.
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="border border-wdbx bg-wdbx px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ink hover:opacity-85"
            >
              Request the data room
            </Link>
          </div>
        </div>
      </Section>
      <NextUp items={[
        { label: "Platform", href: "/platform", desc: "What the product actually does.", accent: "abi" },
        { label: "Contact", href: "/contact", desc: "Request the full data room.", accent: "abbey" },
      ]} />
    </>
  );
}
