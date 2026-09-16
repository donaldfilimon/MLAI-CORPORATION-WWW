# Handoff: MLAI Marketing Website (TSX · Bun · React 19)

## Overview
Full marketing site for MLAI (Machine Learning Advanced Innovations, Inc.) — privacy-first AI infrastructure for Apple Silicon. Six routes: Home, WDBX (vector store), ABI Framework (GPU/ML runtime), Abbey (personas), Research (publications), Company (principles / FAQ / contact).

## About the Design Files
Two things are in this bundle:

1. **`src/` — a runnable TSX implementation** (React 19, TypeScript, Vite, run with Bun). This is a faithful port of the approved design and is intended as the starting point for production.
2. **The HTML design references** live in the parent project (`Home.dc.html`, `WDBX.dc.html`, `ABI.dc.html`, `Abbey.dc.html`, `Research.dc.html`, `About.dc.html`, plus `galaxy.js` and `router.js`). They are prototypes showing intended look and behavior — recreate/verify against them, don't ship them.

If your codebase already has its own React setup, lift `src/pages/*` and `src/components/*` into it rather than adopting this scaffold wholesale.

## Run

```sh
bun install
bun run dev      # vite dev server
bun run build    # type-check + production build
```

Requires Bun ≥ 1.1. React 19 (`createRoot`, no legacy APIs). No server components — this is a static SPA.

## Fidelity
**High-fidelity.** Colors, type, spacing, and copy are final. Recreate pixel-perfectly; all values are inline in the TSX.

## Dependencies & caveats
- **`mlai-site@^2.0.0`** — the published MLAI component library (Nav, Footer, Section, StatBlock, DataTable, PersonaCard, HeroBench, PublicationIndex, …). Import `mlai-site/styles.css` once (done in `src/main.tsx`). **If the package is not on your registry**, vendor the library from the design-system source or bundle (`_ds/mlai-site-design-system-*/_ds_bundle.js` + `_ds_bundle.css` in the parent project).
- **`Nav` / `Footer` render plain `<a href>` links** (the library stubs Next's `Link`). With `BrowserRouter` these cause full-page navigations, which is acceptable for a marketing site; if you want SPA transitions, intercept clicks or swap in your router's Link at the library level. The prototype used the same approach (`router.js`).
- The Nav's routes all have dedicated pages now: Platform (stack overview), Services (engagements), Architecture (six layers + memory model), Investors (thesis + facts), Contact (interactive form). `App.tsx` routes them directly.
- Contact email is a placeholder: `hello@mlai.example`.

## Screens / Views
All pages share: `Nav` (sticky, 64px), page background `#05070B` (`bg-ink`), body font Manrope, headings Sora, labels/eyebrows JetBrains Mono uppercase with 0.15–0.24em tracking, hairline dividers `rgba(255,255,255,0.08)`, content shell `max-width: 1152px; padding: 0 24px`, `Footer` with brand-seam.

### Home (`/`)
- **Hero** (min-height 760px, content bottom-anchored, centered): `Galaxy` particle canvas (80 nodes, cyan `#00D4FF` / violet `#7C3AED` accents), 64px grid overlay masked by a radial fade, cyan key light from top-center + violet fill bottom-right, 220px floor fade to ink. Eyebrow (mono 12px, `#64748B`), H1 80px/1.04/-0.03em white with gradient-clipped "high-performance" (`100deg, #00D4FF → #7C3AED 60% → #10B981`), sub 19px `#94A3B8` max 620px, two pill-less CTA buttons (13px mono uppercase; primary = cyan fill/ink text, hover inverts; secondary = 16% white border), persona legend (7px glowing dots: emerald/violet/cyan). Staggered entrance: `mlaiRise` 700ms cubic-bezier(0.22,1,0.36,1), delays 0/90/180/270/360ms.
- **HeroBench** terminal, max-width 920px, overlapping hero by -20px.
- **Brand seam** (2px tri-color) then numbered sections (kicker format `NN — Title`):
  - 01 The stack — three product cards (`.surface .surface-hover .accent-edge`, `--accent` per product; 34/30px padding; index number, Sora 26px name, accent-colored tagline 16px, body 15px, "Enter →" pinned bottom).
  - 02 Numbers with receipts — panel band `#0A0E16`; 4× `StatBlock` (2.3ms measured / 98.2% measured / 84× measured / 0.92 reported) + `ProvLegend` right-aligned in header row.
  - 03 Personas — `PersonaCard`, Abbey `PullQuote`, "Meet Abbey →" link (emerald).
  - 04 Principles — `DeepDive` 3-col (secrecy / stewardship / velocity).
- **Closing CTA** over sparse galaxy (46 nodes, cyan/emerald): Sora 48px headline "Where does your data have to live?", two CTAs.

### WDBX (`/wdbx`)
Hero (galaxy cyan/violet, left-aligned, `Eyebrow` "Vector store", H1 64px "The fastest vector database alive.", 4 hero StatBlocks + ProvLegend). Sections: Engine (6 `FeatureCard` 3-col), Index structure (`IndexCard` + `SpecList` split), Scale (`DataTable` 100K/1M/10M), Competitive (`DataTable` highlightCol=1 vs Pinecone/Qdrant/Chroma + 3 claim StatBlocks), `NextUp` (ABI, Abbey).

### ABI (`/abi`)
Hero (galaxy violet/cyan, "Apple Silicon, fully spent.", 4 GPU-bench StatBlocks incl. 295× **target**). Sections: Throughput (`ThroughputCard` + silicon `SpecList`), Capabilities (6 FeatureCards), Pipeline (`StepList` 4 steps), NextUp.

### Abbey (`/abbey`)
Hero (galaxy emerald/cyan, "An assistant that remembers — locally."). Sections: Three minds (`PersonaCard` + PullQuote), Capabilities (4 FeatureCards 2-col), Evaluation (4 **reported** StatBlocks + ProvLegend), Platforms (`SpecList` shipping status), NextUp.

### Research (`/research`)
Hero (galaxy violet, "Publications"), `PublicationIndex` (filterable, client component), Glossary (6 terms), NextUp.

### Company (`/company`)
Hero (galaxy emerald, legal name headline). Sections: Principles (`DeepDive` 3-col), Facts (`SpecList` + claims-discipline `Callout`), FAQ (`FAQList`, 5 items, zero-JS `<details>`), Contact (mailto button + research link).

## Interactions & Behavior
- Entrance: fade + 18px rise, 700ms `cubic-bezier(0.22,1,0.36,1)`, staggered ~90ms. Defined once in `src/global.css` as `@keyframes mlaiRise`.
- Galaxy canvases drift slowly and continuously; nodes connect within 130px, line alpha `0.16 × (1 − d/130)`. DPR-capped at 2. **`prefers-reduced-motion`: draw a static frame, kill all animations** (global CSS also nukes animations/transitions).
- Card hover: `.surface-hover` lift from the library. Button hover: primary inverts to transparent/accent text; secondary strengthens border to 45% white. 180ms ease.
- FAQ uses native `<details>`; PublicationIndex has its own filter state.

## State Management
None beyond component-local state inside library components. Routing via `react-router-dom` v7 declarative `<Routes>`.

## Design Tokens
- Ink `#05070B` · panel `#0A0E16` · hairline `rgba(255,255,255,0.08)`
- Accents: wdbx/cyan `#00D4FF` · abi/violet `#7C3AED` (text-highlight `#A78BFA`) · abbey/emerald `#10B981` (text `#34D399`)
- Text ramp: `#FFFFFF` → `#CBD5E1` → `#94A3B8` → `#64748B` → `#475569`
- Type: Sora (display; 80/64/48/44/26px, tracking −0.02 to −0.03em), Manrope (body; 15–19px, 1.65–1.7), JetBrains Mono (labels 11–13px, uppercase, 0.14–0.24em)
- Spacing rhythm: section padding 96px; hero 124–150px top; grids gap 20px; shell 1152px.
- Fonts ship inside `mlai-site` (`fonts/fonts.css` — Sora, Manrope, JetBrains Mono woff2).

## Assets
No raster assets. Logo is `Logo`/`LogoMark` from the library (code-drawn SVG). Galaxy backgrounds are generated by `src/components/Galaxy.tsx`.

## Files
- `src/main.tsx`, `src/App.tsx`, `src/global.css` — entry, routes, keyframes/reset
- `src/components/Galaxy.tsx` — signature particle canvas
- `src/components/site.tsx` — shared layout primitives (Kicker, H2, Lead, Band, PillLink, Hero, HeroTitle, HeroSub)
- `src/pages/{Home,Wdbx,Abi,Abbey,Platform,Services,Architecture,Investors,Research,Company,Contact}.tsx` — all 11 nav routes have dedicated pages; Contact is a fully interactive request-access form (useState validation, selected-chip state, success panel)
- Parent project: `*.dc.html` design references + `galaxy.js` + `router.js`
