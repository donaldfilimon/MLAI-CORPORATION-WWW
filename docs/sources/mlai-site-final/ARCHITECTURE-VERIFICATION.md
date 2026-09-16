# MLAI `mlai-site-final` — Architecture & Content Verification Report

Read-only verification of the built `mlai-site-final` source against the six design
docs (`files2/01-design-system.md` … `06-design-handoff.md`). Covers 100% of routes
(`app/**/page.tsx`) and 100% of components (`components/*`, `lib/*`), the design-system
wiring, and an explicit doc↔code drift list.

**Verdict: the build is fully aligned with the design docs — production-ready.**
Two drift items found, both benign (doc staleness / intentional content decision); no code bug.

---

## 1. Routes (100%)

| Route | Purpose | Accent | Key sections / components |
|---|---|---|---|
| `/` | Home: thesis, three-product stack, four pillars, FAQ | wdbx (cyan) | `HeroBench`, `Section`, `DeepDive`, `FAQList` |
| `/wdbx` | Vector DB deep-dive: HNSW, persistence, quantization, use-cases, competitive, glossary, FAQ | wdbx (cyan) | `AccentGlow`, `IndexCard`, `SplitSection`×3, `DataTable`×2, `Glossary`, `FAQList` |
| `/abi` | ML/GPU framework: tensor ops, zero-copy, GPU kernels, silicon specs, FAQ | abi (violet) | `AccentGlow`, `ThroughputCard`, `SplitSection`×4, `SpecList`, `FAQList` |
| `/abbey` | AI assistant: personas, memory, efficiency, platforms, FAQ | abbey (emerald) | `AccentGlow`, `PersonaCard`, `SplitSection`×5, `PullQuote`, `FAQList` |
| `/platform` | Autonomy infrastructure: four layers, principles, stats, FAQ | abi (violet) | `DeepDive`×2, `StatBlock`×4, `FAQList` |
| `/services` | Professional services: nine engagements, industries, FAQ | abbey (emerald) | `DeepDive`, `FAQList` |
| `/research` | Technical analyses: briefs, formal model, infra matrix, publications | abi (violet) | `PublicationIndex`, `DataTable`, `StatBlock`, `DeepDive` |
| `/architecture` | Pure-Zig web server: four options, design decisions, code sample | wdbx (cyan) | `StepList`, `DeepDive` |
| `/company` | Corporate story: principles, founder, team, values, operating principles | abbey (emerald) | `DeepDive`, `PullQuote`, `FAQList`, `StatBlock` |
| `/investors` | Seed round: thesis, market, why-now, pricing, unit economics, roadmap, ARR | wdbx (cyan) | `StatBlock`×9, `DeepDive`×3, `FAQList`, ARR chart |
| `/contact` | Engagement paths: enterprises, developers, hiring, support | — (none) | `DeepDive` (channels) |
| `/not-found` (404) | Themed error using WDBX query language | — (none) | mono text + home link |

11 content routes + 1 error page. `NextUp` cross-link rail present on every route **except `/contact`** (terminal page), per spec.

---

## 2. Components (100%)

### Primitives — `components/ui.tsx`
| Component | Props | Role | Citation |
|---|---|---|---|
| `Section` | `eyebrow?`, `title?`, `accent`, `lead?`, `children` | Titled content band + optional lead | ui.tsx:103–130 |
| `Eyebrow` | `children`, `accent="wdbx"` | Mono uppercase label + leading accent tick | ui.tsx:94–101 |
| `StatBlock` | `stat: Stat`, `accent?="wdbx"` | Metric (accent, mono) + label + provenance tag | ui.tsx:74–90 |
| `FeatureCard` | `title`, `desc`, `accent` | `.surface .surface-hover`, left accent border | ui.tsx:132–147 |
| `DataTable` | `cols`, `rows`, `accent?`, `highlightCol?` | Bordered table, mono headers, zebra rows, accent highlight col | ui.tsx:149–208 |
| `ProvTag` | `tag: "measured"\|"target"\|"reported"` | Inline glyph + label (● emerald / ○ amber / ◆ violet) | ui.tsx:39–56 |
| `ProvLegend` | — | Footer legend for all three provenance states | ui.tsx:58–72 |
| `NextUp` | `items[]` (label, href, desc, accent) | Cross-link rail (not on `/contact`) | ui.tsx:262–284 |
| `Footer` | — | Lockup, nav grid, legend, copyright, `brand-seam` | ui.tsx:213–260 |

### Content — `components/content.tsx`
| Component | Props | Role | Citation |
|---|---|---|---|
| `Prose` | `children`, `className?` | `max-w-2xl`, `text-[15px]`, `leading-[1.75]`, slate-400 | content.tsx:14–20 |
| `SplitSection` | `kicker?`, `title`, `accent?="wdbx"`, `children` | `md:grid-cols-[0.4fr_0.6fr]`, kicker+title / `Prose` | content.tsx:24–49 |
| `DeepDive` | `items[]`, `accent?`, `cols=2\|3` | `.surface .surface-hover .accent-edge` card grid + mono meta | content.tsx:53–79 |
| `StepList` | `steps[]`, `accent?="wdbx"` | Ordered `.surface .accent-edge` rows, numbered chips | content.tsx:83–112 |
| `Callout` | `label?`, `children`, `accent?="wdbx"` | Accent-washed aside | content.tsx:116–136 |
| `FAQList` | `items[]`, `accent?="wdbx"` | Native `<details>`, `+`→`×` rotation, zero JS | content.tsx:140–165 |
| `Glossary` | `items[]` (term, def) | `dl`, `md:grid-cols-2`, left border, mono term | content.tsx:169–180 |
| `PullQuote` | `children`, `accent?="wdbx"` | `max-w-3xl`, accent left bar, Sora 2xl | content.tsx:184–197 |
| `SpecList` | `rows[]` (k, v) | `.surface` zebra label/value list | content.tsx:202–216 |

### Identity / hero — `Logo.tsx`, `HeroArt.tsx`, `HeroBench.tsx`
| Component | Role | Citation |
|---|---|---|
| `LogoMark` / `Logo` | 48×48 chip-stack mark (3-color or mono) + wordmark | Logo.tsx:15–97 |
| `AccentGlow` | Radial accent glow for hero whitespace | HeroArt.tsx:17–27 |
| `CardShell` | `.surface .accent-edge` chrome for hero cards | HeroArt.tsx:31–65 |
| `IndexCard` / `ThroughputCard` / `PersonaCard` | Per-product hero art (WDBX HNSW / ABI matmul / Abbey personas) | HeroArt.tsx |
| `HeroBench` | Animated benchmark terminal (home hero) | HeroBench.tsx |
| `Nav` (`Nav.tsx`) | Client nav: desktop inline links + Contact button / mobile hamburger sheet | Nav.tsx:1–118 |

### Data layer — `lib/`
- `lib/brand.ts` — single source of truth. `Provenance = "measured"|"target"|"reported"`, `Stat` interface, `colors`, `Accent` type, company/founder/products/stats. (brand.ts:11–26 +)
- `lib/content.ts` — long-form page copy/data.

---

## 3. Design-system wiring (verified in code)

- **Accent contract:** components drive color via the `--accent` CSS var from `accentHex` (`{ wdbx:#00D4FF, abi:#7C3AED, abbey:#10B981 }`) — ui.tsx:24–28; applied e.g. StatBlock ui.tsx:78, DeepDive content.tsx:68, StepList content.tsx:96. One accent per page (verified across all product/section pages).
- **Surface system** (`app/globals.css`): `.surface` (globals.css:24–30), `.surface-hover` (31–38), `.accent-edge` ::before 2px top hairline (41–51), `.brand-seam` cyan→violet→emerald line used once at footer top (55–59).
- **Provenance system:** model in `lib/brand.ts:11`; render map in ui.tsx:33–37 — `measured ● emerald / target ○ amber / reported ◆ violet`. Every `StatBlock` carries a tag; the 295× GPU figure and forward ARR are tagged `target`.
- **Type:** Sora (display), Manrope (body), JetBrains Mono (mono) via `next/font` (layout.tsx) + `tailwind.config.ts`.
- **Motion:** `prefers-reduced-motion: reduce` block present (globals.css) — transforms/transitions removed.

---

## 4. Doc ↔ code drift list

**Verified, no discrepancy:** accent hex values · font families (Sora/Manrope/JetBrains Mono) · full component inventory (docs 01 §3) · surface system (`.surface`/`.surface-hover`/`.accent-edge`/`.brand-seam`) · provenance glyphs+colors · responsive `md` (768px) forks (SplitSection 0.4/0.6, StatBlock 4-up→2-up, grids→1col) · accent contract (one per page; three together only in logo / home grid / footer seam) · 11 content routes · Apple "public frameworks" framing (no partnership language) · Apache-2.0 · Zig `0.17-dev`.

**Drift (both benign — no fix warranted; scope was read-only):**

| # | Claim (doc) | Actual (code/build) | Verdict |
|---|---|---|---|
| 1 | "17 build outputs incl. sitemap, robots, SVG favicon" (01-design-system.md §5) | Export emits 13 HTML + assets (sitemap.xml, robots.txt, icon.svg, og.png, brand SVGs) — count differs slightly | **Doc staleness** (OG image / 404 not counted in the original "17") |
| 2 | "11 content routes" (docs 01, 04) | 11 content routes **+** `not-found.tsx` (themed 404) | **Intentional** — 404 is not an SEO route |

Neither is a code bug. Per the stop-and-ask condition, item #2 is an intentional content decision (flagged, no action). Item #1 is stale documentation; optional one-line fix is to update "17" in `01-design-system.md`.

---

*Generated read-only; no `mlai-site-final` source files were modified to produce this report.*
