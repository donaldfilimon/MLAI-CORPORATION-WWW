import { useParams, Link } from "react-router-dom";
import { m, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { products } from '@/data/categories/products';
import { BlockMath } from "@/components/Math";
import { PersonaRouterDemo } from "@/components/demos/PersonaRouterDemo";
import { CosineSimDemo } from "@/components/demos/CosineSimDemo";
import { ShardingLatencyDemo } from "@/components/demos/ShardingLatencyDemo";

// Persona accent classes — same palette as the Docs persona dots.
const ACCENT = {
  abbey: {
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    glow: "radial-gradient(50% 55% at 28% 0%, rgba(52,211,153,0.14), transparent 70%)",
    rule: "from-emerald-400/60",
  },
  aviva: {
    text: "text-violet-400",
    border: "border-violet-500/30",
    bg: "bg-violet-500/5",
    glow: "radial-gradient(50% 55% at 28% 0%, rgba(168,85,247,0.14), transparent 70%)",
    rule: "from-violet-400/60",
  },
  abi: {
    text: "text-sky-400",
    border: "border-sky-500/30",
    bg: "bg-sky-500/5",
    glow: "radial-gradient(50% 55% at 28% 0%, rgba(56,189,248,0.14), transparent 70%)",
    rule: "from-sky-400/60",
  },
} as const;

const DEMOS = {
  "persona-router": PersonaRouterDemo,
  "cosine-sim": CosineSimDemo,
  "sharding-latency": ShardingLatencyDemo,
} as const;

export function Product() {
  const { slug } = useParams();
  const shouldReduceMotion = useReducedMotion();
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="pt-10">
        <section className="section-y">
          <div className="container-custom">
            <h1 className="section-title">Product not found</h1>
            <Link to="/" className="mt-4 inline-flex items-center gap-2 text-primary">
              Back home <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const accent = ACCENT[product.accent];
  const reveal = shouldReduceMotion
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <div className="relative pt-10">
      {/* persona atmosphere — the page is lit in the product's color */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
        style={{ background: accent.glow }}
      />

      <section className="section-y relative">
        <div className="container-custom">
          {/* editorial masthead — kicker rail + oversized name */}
          <div className="mb-24 grid gap-6 lg:grid-cols-[1fr_2fr] lg:gap-12">
            <div className="pt-3">
              <p className={`font-mono text-[11px] uppercase tracking-[0.38em] ${accent.text}`}>
                {product.kicker}
              </p>
              <div className={`mt-5 h-px w-24 bg-linear-to-r ${accent.rule} to-transparent`} />
            </div>
            <div>
              <m.h1
                {...(shouldReduceMotion
                  ? { initial: false }
                  : {
                      initial: { opacity: 0, y: 26 },
                      animate: { opacity: 1, y: 0 },
                      transition: { duration: 0.7 },
                    })}
                className="font-display text-6xl font-bold tracking-tight text-white md:text-8xl"
              >
                {product.name}
                <span className={accent.text}>.</span>
              </m.h1>
              <m.p
                {...(shouldReduceMotion
                  ? { initial: false }
                  : {
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 },
                      transition: { duration: 0.7, delay: 0.1 },
                    })}
                className="mt-7 max-w-2xl text-lg leading-relaxed text-text-dim"
              >
                {product.intro}
              </m.p>
            </div>
          </div>

          <div className="space-y-28">
            {product.sections.map((section, idx) => {
              const Demo = section.demo ? DEMOS[section.demo] : null;
              const num = String(idx + 1).padStart(2, "0");
              return (
                <m.div key={section.title} {...reveal}>
                  {/* numbered editorial section: index rail · content */}
                  <div className="grid gap-6 lg:grid-cols-[1fr_2fr] lg:gap-12">
                    <div className="relative">
                      <span
                        aria-hidden="true"
                        className="pointer-events-none select-none font-display text-7xl font-bold leading-none text-white/[0.06] md:text-8xl"
                      >
                        {num}
                      </span>
                      <div className="mt-2">
                        <span className={`font-mono text-[10px] uppercase tracking-[0.3em] ${accent.text}`}>
                          {section.eyebrow}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h2 className="mb-4 font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
                        {section.title}
                      </h2>
                      {section.sub && (
                        <p className="mb-7 max-w-2xl text-sm leading-relaxed text-text-dim">
                          {section.sub}
                        </p>
                      )}

                      {section.paragraphs.map((p) => (
                        <p key={p.slice(0, 32)} className="mb-4 max-w-3xl leading-relaxed text-text-dim">
                          {p}
                        </p>
                      ))}

                      {section.equations && (
                        <div className="mt-2 grid gap-5 md:grid-cols-2">
                          {section.equations.map((eq) => (
                            <div
                              key={eq.tex}
                              className="glass-card group/eq relative overflow-hidden p-5"
                            >
                              <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 translate-x-[-110%] bg-linear-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-700 group-hover/eq:translate-x-[110%]"
                              />
                              <BlockMath tex={eq.tex} />
                              <p className="mt-3 text-xs leading-relaxed text-text-dim">{eq.note}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {section.blendTable && (
                        <div className="mt-7 max-w-xl space-y-3">
                          {section.blendTable.map((row) => {
                            const a = ACCENT[row.accent];
                            return (
                              <div key={row.range} className={`rounded-lg border p-3 ${a.border} ${a.bg}`}>
                                <div className={`font-mono text-xs ${a.text}`}>{row.range}</div>
                                <div className="mt-0.5 text-sm text-gray-300">{row.meaning}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {Demo && (
                        <div className="mt-7 max-w-2xl">
                          <Demo />
                        </div>
                      )}

                      {section.pillars && (
                        <div
                          className={`mt-7 grid gap-5 ${section.pillars.length === 4 ? "sm:grid-cols-2" : "md:grid-cols-3"}`}
                        >
                          {section.pillars.map((pillar) => {
                            const a = ACCENT[pillar.accent ?? product.accent];
                            return (
                              <div
                                key={pillar.title}
                                className="glass-card flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1"
                              >
                                <h3 className={`mb-2 text-sm font-bold ${a.text}`}>{pillar.title}</h3>
                                <p className="text-sm leading-relaxed text-text-dim">
                                  {pillar.description}
                                </p>
                                {pillar.eq && (
                                  <div className="mt-auto pt-4">
                                    <BlockMath tex={pillar.eq} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {section.steps && (
                        <div className="mt-7 space-y-3">
                          {section.steps.map((step) => (
                            <div
                              key={step.n}
                              className="glass-card flex gap-4 border-l-4 border-l-emerald-400/60 p-4 transition-transform duration-300 hover:translate-x-1"
                            >
                              <span className="w-8 shrink-0 text-lg font-black text-emerald-400">
                                {step.n}
                              </span>
                              <div>
                                <h3 className="text-sm font-bold text-white">{step.title}</h3>
                                <p className="mt-0.5 text-sm leading-relaxed text-text-dim">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {section.chips && (
                        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {section.chips.map((chip) => (
                            <div
                              key={chip}
                              className="glass-card p-4 text-center font-mono text-sm font-medium text-white"
                            >
                              {chip}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </m.div>
              );
            })}
          </div>

          {/* cross-navigation */}
          <div className="mt-28 flex flex-wrap gap-4 border-t border-white/8 pt-10">
            {products
              .filter((p) => p.slug !== product.slug)
              .map((p) => (
                <Link
                  key={p.slug}
                  to={`/products/${p.slug}`}
                  className="glass-card group inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white"
                >
                  {p.name}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            <Link
              to="/benchmarks"
              className="glass-card group inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white"
            >
              WDBX Benchmarks
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/showcase"
              className="glass-card group inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white"
            >
              The projection room
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
