import Link from "next/link";
import { products, investors, company, research, platform, github } from "@/lib/brand";
import {
  Section,
  Eyebrow,
  FeatureCard,
  accentText,
  accentHex,
} from "@/components/ui";
import { HeroBench } from "@/components/HeroBench";
import { Prose, DeepDive, FAQList } from "@/components/content";
import { overview } from "@/lib/content";

export default function Home() {
  const w = products.wdbx;
  return (
    <>
      {/* Hero — typographic thesis + live-style benchmark readout */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-24 md:pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
          <div>
            <Eyebrow accent="wdbx">Machine Learning Advanced Innovations</Eyebrow>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl xl:text-7xl">
              AI infrastructure that never phones home.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              {company.tagline} A Zig-built vector database, a Metal-native ML framework, and an
              assistant with local memory — engineered so the inference, the index, and the data all
              live on the same chip.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/wdbx"
                className="border border-wdbx bg-wdbx px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ink transition-opacity hover:opacity-85"
              >
                Explore WDBX
              </Link>
              <Link
                href="/investors"
                className="border border-line px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
              >
                Investor brief
              </Link>
            </div>
            <p className="mt-8 max-w-xl font-mono text-[11px] leading-relaxed text-slate-600">
              {company.appleFraming}
            </p>
          </div>

          <div className="lg:pt-2">
            <HeroBench />
          </div>
        </div>
      </section>

      <Section eyebrow="The premise" title="Capable AI, where you can see it" accent="wdbx">
        <Prose className="max-w-3xl">
          <p className="text-[17px] leading-[1.7] text-slate-300">{overview.thesis}</p>
          {overview.paragraphs.map((para, i) => (<p key={i}>{para}</p>))}
        </Prose>
      </Section>

      {/* Three products */}
      <Section eyebrow="The stack" title="Three layers. One chip." accent="wdbx">
        <div className="grid gap-6 md:grid-cols-3">
          {([products.wdbx, products.abi, products.abbey] as const).map((p) => (
            <Link
              key={p.name}
              href={p.href}
              className="group surface surface-hover accent-edge p-6"
              style={{ ["--accent" as string]: accentHex[p.accent] }}
            >
              <div className={`font-mono text-xs uppercase tracking-[0.25em] ${accentText[p.accent]}`}>
                {p.accent === "wdbx" ? "Storage" : p.accent === "abi" ? "Compute" : "Application"}
              </div>
              <h3 className="mt-3 font-display text-2xl font-semibold text-white">{p.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.sub}</p>
              <div
                className={`mt-5 font-mono text-xs uppercase tracking-[0.15em] ${accentText[p.accent]} translate-x-0 opacity-60 transition-all group-hover:translate-x-1 group-hover:opacity-100`}
              >
                Read the spec →
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Platform layers */}
      <Section
        eyebrow="Platform"
        title="Autonomy you can inspect."
        accent="abi"
        lead={platform.intro}
      >
        <div className="grid gap-px border border-line bg-line md:grid-cols-4">
          {platform.layers.map((l) => (
            <div key={l.title} className="bg-panel p-5">
              <h3 className="font-display text-base font-semibold text-white">{l.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{l.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Link
            href="/platform"
            className="font-mono text-xs uppercase tracking-[0.15em] text-abi hover:text-white"
          >
            The full platform →
          </Link>
        </div>
      </Section>

      {/* Why now strip */}
      <Section
        eyebrow="Why now"
        title="Five trends, one window."
        accent="abi"
        lead="The AI infrastructure market is repeating the mobile transition. Native-first builders captured the last platform shift; on-device AI is the next one."
      >
        <div className="grid gap-px border border-line bg-line md:grid-cols-5">
          {investors.whyNow.map((t) => (
            <div key={t.title} className="bg-panel p-5">
              <div className="font-mono text-lg font-bold text-abi">{t.metric}</div>
              <div className="mt-1 text-sm font-semibold text-white">{t.title}</div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Link
            href="/investors"
            className="font-mono text-xs uppercase tracking-[0.15em] text-abi hover:text-white"
          >
            The full case, with sources →
          </Link>
        </div>
      </Section>

      {/* Engineering proof */}
      <Section
        eyebrow="Engineering"
        title="Built like systems software, because it is."
        accent="abbey"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FeatureCard
            accent="abbey"
            title="Zig 0.17-dev core, no garbage collector"
            desc="Deterministic memory management keeps p99 latency glued to p50 — no GC pauses, no jitter. Comptime specializes vector kernels for the exact target ISA."
          />
          <FeatureCard
            accent="abbey"
            title="Provenance-tagged benchmarks"
            desc="Every number on this site is tagged measured, target, or reported — and the legend lives in the footer. We don't ship numbers we can't reproduce."
          />
          <FeatureCard
            accent="abbey"
            title="MVCC + hash-chained WAL"
            desc="Readers never block writers. The write-ahead log is hash-chained for tamper-evident audit trails and neural backtracking through agent state."
          />
          <FeatureCard
            accent="abbey"
            title="One binary, every platform"
            desc="zig build cross-compiles static binaries for macOS, Linux, and Windows. The database and its server ship as one artifact."
          />
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/research"
            className="border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-slate-300 hover:border-slate-500 hover:text-white"
          >
            Research briefs
          </Link>
          <Link
            href="/architecture"
            className="border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-slate-300 hover:border-slate-500 hover:text-white"
          >
            Server architecture
          </Link>
        </div>
        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-slate-600">{research.intro}</p>
      </Section>

      {/* CTA */}
      <Section accent="wdbx">
        <div className="border border-line bg-panel p-10 text-center md:p-16">
          <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">
            Run the benchmark yourself.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            The harness ships in the repo — {github.repo}, {github.license}, {github.commits}{" "}
            commits and counting. If your number beats ours on the same hardware, we want the issue.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="border border-wdbx bg-wdbx px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ink hover:opacity-85"
            >
              Get in touch
            </Link>
            <Link
              href="/wdbx"
              className="border border-line px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-slate-300 hover:border-slate-500 hover:text-white"
            >
              WDBX benchmarks
            </Link>
          </div>
        </div>
      </Section>
      <Section eyebrow="What we stand on" title="Four properties, not four features" accent="wdbx">
        <DeepDive items={overview.pillars} accent="wdbx" cols={2} />
      </Section>

      <Section eyebrow="Questions" title="The short version" accent="wdbx">
        <FAQList items={overview.faq} accent="wdbx" />
      </Section>

    </>
  );
}
