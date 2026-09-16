# MLAI Design System

The system behind the MLAI corporate site. It is a **refined-technical dark** language: developer-native at its core, with Apple-grade spacing, type discipline, and flat surfaces layered on top. Everything here is implemented in the live site — this document describes what exists, not an aspiration.

---

## 1. Design tokens

### Color

| Token | Value | Role |
|---|---|---|
| `ink` | `#05070B` | Page background — near-black with a cool cast |
| `panel` | `#0A0E16` | Raised surface (cards, code blocks, footer) |
| `line` | `rgba(255,255,255,0.08)` | Hairline borders, dividers |
| `wdbx` | `#00D4FF` | Product accent — cyan |
| `abi` | `#7C3AED` | Product accent — violet |
| `abbey` | `#10B981` | Product accent — emerald |
| `warn` | `#F59E0B` | Provenance "target" amber |

Accent usage is **product-scoped**: a WDBX page is cyan throughout, ABI violet, Abbey emerald. The three accents only appear together in three places — the logo, the homepage product grid, and the footer brand-seam — where they signify the whole stack.

Text is a slate ramp: `text-white` for headings, `slate-200/300` for emphasis body, `slate-400` for body, `slate-500/600` for meta and captions.

### Type

| Family | Variable | Use |
|---|---|---|
| **Sora** | `--font-sora` | Display — headings, wordmark, large numbers |
| **Manrope** | `--font-manrope` | Body — prose, UI labels |
| **JetBrains Mono** | `--font-jbm` | Mono — code, eyebrows, metrics, provenance |

Type scale (display): hero `text-5xl→6xl` bold tracking-tight; section titles `text-3xl→4xl`; sub-heads `text-2xl` semibold; deep-dive titles `text-lg`. Body runs `15px` with `1.75` leading and a `max-w-2xl` measure cap — the Apple-grade readability constraint.

### Spacing & radius

- Section rhythm: `py-20→24` vertical, `max-w-6xl` container, `px-6` gutters.
- Prose measure capped at `max-w-2xl`; thesis copy at `max-w-3xl`.
- Radius is restrained: `rounded-xl` on FAQ/containers, `rounded-full` only on step-number chips and accent bars. Cards use crisp `1px` borders over heavy rounding — the flat-modern signature.

---

## 2. Surface system

Defined in `globals.css` under `@layer components`. This is what gives the flat dark surfaces depth without drop-shadows-everywhere.

- **`.surface`** — top-down sheen gradient + inset `1px` highlight + hairline border. The base raised card.
- **`.surface-hover`** — border brightens, `translateY(-2px)`, soft shadow on hover.
- **`.accent-edge`** — a `::before` 2px accent hairline along the top edge, fading to the right; driven by a `--accent` CSS variable so any product color can flow through.
- **`.brand-seam`** — a single cyan→violet→emerald `1px` gradient line, used exactly once, at the top of the footer.

All motion is wrapped in `prefers-reduced-motion` — animations and transitions are removed for users who ask for that.

---

## 3. Component inventory

### Primitives (`components/ui.tsx`)
- `Section` — titled content band (eyebrow + title + optional lead).
- `Eyebrow` — mono uppercase label with a leading accent-tick spine.
- `StatBlock` — large metric + label + provenance tag.
- `FeatureCard` — title + description card on a surface.
- `DataTable` — bordered table with header band, zebra rows, optional accent-washed highlight column.
- `ProvTag` / `ProvLegend` — provenance dots and their legend.
- `NextUp` — cross-link rail between related pages.

### Content components (`components/content.tsx`)
- `Prose` — long-form body with measure cap and relaxed leading.
- `SplitSection` — editorial left-rail label + prose, the two-column deep-dive rhythm.
- `DeepDive` — 2- or 3-column card grid for richer feature/use-case breakdowns.
- `StepList` — numbered sequence (real sequences only — request lifecycle, build flow).
- `Callout` — accent-washed aside for a single important idea.
- `FAQList` — native `<details>` accordion, zero added JS, `+`→`×` rotation.
- `Glossary` — term/definition list.
- `PullQuote` — large single-line thesis statement, accent left-bar, never attributed to a real person.
- `SpecList` — tight label/value list for config facts.

### Identity (`components/Logo.tsx`, `components/HeroArt.tsx`, `components/HeroBench.tsx`)
- `LogoMark` / `Logo` — the chip-stack mark and wordmark lockup (see brand guidelines).
- `AccentGlow`, `IndexCard`, `ThroughputCard`, `PersonaCard` — hero identity art per product.
- `HeroBench` — the animated benchmark terminal on the homepage hero.

---

## 4. Provenance system — the non-negotiable

Every quantitative claim carries a tag describing **how it is known**. This is encoded in the data model (`Stat.provenance` in `lib/brand.ts`), not left to copy.

| Tag | Glyph | Color | Meaning |
|---|---|---|---|
| `measured` | ● filled | emerald | Reproduced on MLAI hardware; harness in the repo |
| `target` | ○ hollow | amber | An engineering goal we are building toward |
| `reported` | ◆ diamond | violet | A figure from a cited research document |

The three are never blurred. A target is never shown as a result. This rule is enforced in components (`ProvTag`) and in review (see brand review doc).

---

## 5. Build & stack

Bun · Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS. Static export (`output: "export"`, `trailingSlash: true`). The export produces 13 HTML files (11 content routes + a 404) plus assets: `sitemap.xml`, `robots.txt`, the `icon.svg` favicon, `og.png`, and the brand SVGs. First Load JS ~115 kB — content is server-rendered HTML; the FAQ accordion uses native `<details>` for zero added JS.
