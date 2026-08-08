/**
 * `site/` — the section-level building blocks for marketing and documentation
 * pages, one layer above the shadcn primitives in `components/ui/`.
 *
 * Harvested from the `mlai-site` design system (the "MLAI Design System" and
 * "MLAI Site Design System" Claude Design projects) and re-tokenized onto this
 * repo's canonical "Lab" brand — cyan/violet/emerald on the ink canvas, Spectral
 * display, Geist body. The upstream's Sora/Manrope/`#00D4FF` prototype identity
 * is retired and deliberately not carried over.
 *
 * Two rules these components exist to enforce:
 *
 *  1. **No baked-in copy or figures.** Every component takes its content as
 *     props; the site's own words and numbers live in `src/data/categories/*`.
 *     The upstream versions shipped sample metrics (p50 latencies, speedup
 *     multiples, recall percentages) that this site cannot publish unbacked.
 *  2. **Figures carry provenance.** `StatBlock` and `ThroughputCard` require a
 *     `tag` of `measured | target | reported` — see `docs/master-reference.md`.
 */

export { accentClasses, ACCENTS, type Accent } from "./accent";

export { ProvTag, ProvLegend, type ProvTagProps, type ProvLegendProps, type Provenance } from "./ProvTag";
export { Eyebrow, type EyebrowProps } from "./Eyebrow";
export { Section, SplitSection, type SectionProps, type SplitSectionProps } from "./Section";
export { FeatureCard, type FeatureCardProps } from "./FeatureCard";
export { StatBlock, type StatBlockProps, type Stat } from "./StatBlock";
export { SpecList, type SpecListProps, type SpecRow } from "./SpecList";
export { StepList, type StepListProps, type Step } from "./StepList";
export { DataTable, type DataTableProps } from "./DataTable";
export { DeepDive, type DeepDiveProps, type DeepDiveItem } from "./DeepDive";
export { Callout, PullQuote, type CalloutProps, type PullQuoteProps } from "./Callout";
export { Glossary, type GlossaryProps, type GlossaryItem } from "./Glossary";
export { FAQList, type FAQListProps, type FAQItem } from "./FAQList";
export { NextUp, type NextUpProps, type NextUpItem } from "./NextUp";
export { Prose, type ProseProps } from "./Prose";
export { AccentGlow, type AccentGlowProps } from "./AccentGlow";
export { PersonaCard, type PersonaCardProps, type Persona, type PersonaKey } from "./PersonaCard";
export { IndexCard, type IndexCardProps, type IndexLayer } from "./IndexCard";
export { ThroughputCard, type ThroughputCardProps, type ThroughputRow } from "./ThroughputCard";
export { HeroBench, type HeroBenchProps } from "./HeroBench";
export { PublicationIndex, type PublicationIndexProps, type Publication } from "./PublicationIndex";

// Reconciled with existing repo components rather than duplicated:
//   Nav      → src/components/Navbar.tsx (already the site's sticky nav)
//   Footer   → src/components/Footer.tsx (now renders <ProvLegend variant="inline" />)
//   Logo     → src/components/Logo.tsx   (gained `mono`)
//
// Only `LogoMark` is re-exported here. `Logo` links to "/" via the
// react-router-dom shim, and anything importing that shim pulls Next's client
// runtime into the design-system bundle, where it throws at module scope
// (`process.env.__NEXT_*` is undefined in a plain browser) and takes every
// other export down with it. `LogoMark` lives in its own router-free module
// for exactly that reason — see the note in `../LogoMark.tsx`.
export { LogoMark, type LogoMarkProps } from "../LogoMark";
