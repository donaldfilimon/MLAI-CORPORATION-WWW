import { useParams, Link } from "react-router-dom";
import { m, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { products } from '@/data/categories/products';
import { BlockMath } from "@/components/Math";
import { PersonaRouterDemo } from "@/components/demos/PersonaRouterDemo";
import { CosineSimDemo } from "@/components/demos/CosineSimDemo";
import { ShardingLatencyDemo } from "@/components/demos/ShardingLatencyDemo";
import {
  AccentGlow,
  Callout,
  CardPanel,
  Eyebrow,
  FeatureCard,
  NextUp,
  Section,
  SplitSection,
  StepList,
  accentClasses,
  type Accent,
  type NextUpItem,
} from "@/components/site";
import { cn } from "@/lib/utils";

/**
 * The content layer labels things on the **persona** axis (`abbey` emerald ·
 * `aviva` violet · `abi` cyan — the Docs persona dots). The `site/` components
 * take the **product** axis (`wdbx` cyan · `abi` violet · `abbey` emerald).
 * The two share the name "abi" and mean different colors, so they are mapped
 * explicitly here rather than passed through. The resulting ramps are the same
 * ones this page has always used.
 */
const PERSONA_ACCENT: Record<"abbey" | "aviva" | "abi", Accent> = {
  abbey: "abbey", // emerald
  aviva: "abi", // violet
  abi: "wdbx", // cyan
};

/**
 * The page is lit in the accent of the *product* it renders — not of a
 * persona — so it derives from the slug and stays correct for either product.
 */
const PRODUCT_ACCENT: Record<string, Accent> = {
  abi: "abi", // ABI Framework → violet
  abbey: "abbey", // Abbey → emerald
};

const DEMOS = {
  "persona-router": PersonaRouterDemo,
  "cosine-sim": CosineSimDemo,
  "sharding-latency": ShardingLatencyDemo,
} as const;

/** Masthead/section rail width, shared so the kicker rails line up. */
const RAIL = "lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16";

/**
 * `SplitSection` carries its own `.section-y`, so stacking six of them would
 * roughly double the inter-section rhythm this page was designed with
 * (`space-y-28` inside one band). Utilities beat the components-layer
 * `.section-y`, so this trims each band back to the original cadence.
 */
const BAND = "py-12 md:py-14 lg:py-16";

export function Product() {
  const { slug } = useParams();
  const shouldReduceMotion = useReducedMotion();
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="pt-10">
        <Section>
          <h1 className="section-title">Product not found</h1>
          <Link to="/" className="mt-4 inline-flex items-center gap-2 text-primary">
            Back home <ArrowRight size={14} />
          </Link>
        </Section>
      </div>
    );
  }

  const pageAccent: Accent = PRODUCT_ACCENT[product.slug] ?? "wdbx";
  const a = accentClasses(pageAccent);

  // Cross-navigation derives from the content layer, so it can never point at
  // the page you are already on. Descriptions for the sibling products are the
  // products' own kickers rather than new copy.
  const nextUp: NextUpItem[] = [
    ...products
      .filter((p) => p.slug !== product.slug)
      .map((p) => ({
        label: p.name,
        href: `/products/${p.slug}`,
        desc: p.kicker,
        accent: PRODUCT_ACCENT[p.slug] ?? "wdbx",
      })),
    {
      label: "WDBX Benchmarks",
      href: "/benchmarks",
      desc: "The WDBX benchmark page.",
      accent: "wdbx",
    },
    {
      label: "Documentation",
      href: "/docs",
      desc: "Platform and WDBX documentation.",
      accent: "wdbx",
    },
    {
      label: "The projection room",
      href: "/showcase",
      desc: "The cinematic showcase surfaces.",
      accent: "abi",
    },
  ];

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
      {/* product atmosphere — the page is lit in the product's color */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-140 overflow-hidden"
      >
        <AccentGlow accent={pageAccent} />
      </div>

      {/* editorial masthead — kicker rail + oversized name */}
      <section className="section-y relative pb-4 md:pb-6">
        <div className="container-custom">
          <div className={cn("grid gap-6", RAIL)}>
            <div className="pt-3">
              <Eyebrow accent={pageAccent}>{product.kicker}</Eyebrow>
              <span
                aria-hidden="true"
                className={cn("mt-5 block h-px w-24 rounded-full", a.dot)}
              />
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
                <span className={a.text}>.</span>
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
        </div>
      </section>

      {product.sections.map((section) => {
        const Demo = section.demo ? DEMOS[section.demo] : null;
        return (
          <m.div key={section.title} {...reveal}>
            <SplitSection
              kicker={section.eyebrow}
              title={section.title}
              accent={pageAccent}
              className={BAND}
            >
              {section.sub && <p className="max-w-2xl text-sm">{section.sub}</p>}

              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}

              {/* `text-foreground` is load-bearing: KaTeX inherits `color`, and
                  SplitSection's prose column is `text-text-dim`. Without it every
                  equation renders a step dimmer than it did before. */}
              {section.equations && (
                <div className="grid gap-5 text-foreground md:grid-cols-2">
                  {section.equations.map((eq) => (
                    <CardPanel key={eq.tex} gap="sm" className="h-full">
                      <BlockMath tex={eq.tex} />
                      <p className="text-xs leading-relaxed text-text-dim">{eq.note}</p>
                    </CardPanel>
                  ))}
                </div>
              )}

              {section.blendTable && (
                <div className="max-w-xl space-y-3">
                  {section.blendTable.map((row) => (
                    // Per-row accent stays on the persona axis: the color is
                    // the key linking each α band to the persona it selects.
                    <Callout
                      key={row.range}
                      label={row.range}
                      accent={PERSONA_ACCENT[row.accent]}
                    >
                      {row.meaning}
                    </Callout>
                  ))}
                </div>
              )}

              {/* Demos keep their own render path and mounting behavior; the
                  wrapper only restores the inherited body color. */}
              {Demo && (
                <div className="max-w-2xl text-foreground">
                  <Demo />
                </div>
              )}

              {section.pillars && (
                <div
                  className={cn(
                    "grid gap-5",
                    section.pillars.length === 4 ? "sm:grid-cols-2" : "md:grid-cols-3",
                  )}
                >
                  {section.pillars.map((pillar) => {
                    const pa = PERSONA_ACCENT[pillar.accent ?? product.accent];
                    // FeatureCard takes no children, so pillars carrying a
                    // KaTeX loss function mirror its internals by hand.
                    return pillar.eq ? (
                      <CardPanel key={pillar.title} gap="sm" className="h-full text-foreground">
                        <span
                          aria-hidden="true"
                          className={cn("h-px w-10 rounded-full", accentClasses(pa).dot)}
                        />
                        <h3 className="font-display text-lg font-semibold text-white">
                          {pillar.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-text-dim text-pretty">
                          {pillar.description}
                        </p>
                        <div className="mt-auto pt-4">
                          <BlockMath tex={pillar.eq} />
                        </div>
                      </CardPanel>
                    ) : (
                      <FeatureCard
                        key={pillar.title}
                        title={pillar.title}
                        desc={pillar.description}
                        accent={pa}
                        className="h-full"
                      />
                    );
                  })}
                </div>
              )}

              {section.steps && (
                <StepList
                  accent={pageAccent}
                  steps={section.steps.map((step) => ({
                    title: step.title,
                    body: step.description,
                  }))}
                />
              )}

              {section.chips && (
                <div className="flex flex-wrap gap-3">
                  {section.chips.map((chip) => (
                    // `.label-chip` is hardcoded cyan; the accent utilities
                    // override it so the chips match the product's ramp.
                    <span key={chip} className={cn("label-chip", a.border, a.bg, a.text)}>
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </SplitSection>
          </m.div>
        );
      })}

      {/* `pt-*` trims the band so the divider sits the same distance below the
          last section as it did when the page was one `section-y` block. */}
      <Section className="pt-6 md:pt-8">
        <div className="border-t border-white/8 pt-10">
          <NextUp items={nextUp} />
        </div>
      </Section>
    </div>
  );
}
