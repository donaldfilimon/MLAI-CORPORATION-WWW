# MLAI — Corporate Site (Final)

Bun + Next.js 15 (App Router) + React 19 + TypeScript strict + Tailwind 3.4.
Static export (`output: "export"`, `trailingSlash: true`) — 9 content routes,
deployable to any static host with zero rewrite rules.

## Final — content engine, logo, docs

The "final site" pass. Roughly 3× content depth across every route, a real logo system, and six accompanying brand/design/engineering documents.

- **Logo system** — `components/Logo.tsx` (`LogoMark`, `Logo`) + standalone SVGs in `public/brand/` (color, mono, lockup). Apple-flat chip-stack mark encoding "three layers, one chip." Wired into nav, footer, and favicon (`app/icon.svg`).
- **Content engine** — new `lib/content.ts` holds the long-form prose layer (grounded in `lib/brand.ts`, zero new numbers); new `components/content.tsx` renders it (`Prose`, `SplitSection`, `DeepDive`, `StepList`, `Callout`, `FAQList`, `Glossary`, `PullQuote`, `SpecList`).
- **Every page expanded** — how-it-works / why-it-exists prose, editorial split-sections, deep-dive grids, glossaries, and zero-JS FAQ accordions. Abbey saw the largest expansion; WDBX roughly tripled.
- **Apple-grade polish** — measure caps, type discipline, flat surfaces, native `<details>` FAQ (First Load JS held at ~115 kB despite the content growth).
- **Docs** — design system, brand guidelines, brand voice, brand review, system design, and design handoff (shipped alongside the site).

## Routes
/ · /wdbx · /abi · /abbey · /platform · /services · /research · /architecture · /company · /investors · /contact

## v2.3 — improvements
- Architecture: five-layer stack diagram (Apple Silicon → Metal/Accelerate/Core ML
  → WDBX → ABI → Abbey) with accent-coded layers and a trace-layer rail spanning
  L1–L5. Fixed a stray "0.17-dev-dev" string from the version sweep.
- ABI: persona-routing pipeline strip — intent → abi → abbey/aviva → policy gate
  → execute → dqn loop, with role separation called out.
- Cross-links: NextUp rail on /wdbx, /abi, /abbey, /platform so product pages
  no longer dead-end.
- Custom 404 (app/not-found.tsx) in site voice — "recall@10 = 0.000".
- OG share image (public/og.png, 1200×630) rendered with the site fonts and the
  provenance legend; wired into openGraph + twitter metadata.

## v2.2 — improvements
- Hero: animated benchmark terminal (HeroBench, client component) — query log
  lines stream in on load; prefers-reduced-motion renders all lines statically.
- Research: publication index is filterable by track (client component,
  aria-pressed buttons with per-tag counts).
- Services: nine engagements grouped into the real arc — Assess / Build / Assure.
- Platform: concrete trace-event stream sample (retrieve → policy gate →
  operator approval → execute → evaluate), labeled illustrative.
- SEO/a11y: metadataBase + OpenGraph + Twitter cards, JSON-LD Organization
  schema, sitemap.xml + robots.txt (force-static), skip-to-content link.
- Footer: external links (GitHub, docs, founder). Homepage why-now strip
  compressed to metrics + titles with link-out to /investors.




## v2.4 — styling pass II
- **Section-header spine** — every `Eyebrow` now leads with a short accent tick
  (colored per section), giving long pages (investors, wdbx, abi) a consistent
  left-edge rhythm instead of free-floating labels.
- **DataTable, crafted** — surface depth + accent-edge top hairline, a tinted
  header band, zebra-striped rows for cross-column scanning, and a faint vertical
  wash on the highlighted column so the "WDBX vs the field" comparison reads as
  *us* at a glance.
- Verified: tsc clean, 16/16 static, 105 kB shared JS (unchanged).

## v2.3 — styling pass
- **Hero identity cards** — each product hero gains a labeled artifact card
  (`components/HeroArt.tsx`) echoing the homepage benchmark terminal, populated
  with that product's real structure:
  - WDBX → HNSW layer card (sparse L2 → dense L0, opacity-graded nodes).
  - ABI → GPU matmul speedup ladder (log-scaled bars; the 295× *target* bar is
    hatched and ○-marked to distinguish it from measured bars).
  - Abbey → three-persona card, each row carrying its persona's accent edge.
  This solves the empty-right-half problem on product heroes the same way the
  homepage was solved — with substance, not decoration. Server components, 0 JS.
- **Accent atmosphere** — a restrained radial glow per product hero (cyan / violet
  / emerald), aria-hidden, turning whitespace into intentional colored space.
- **Surface-depth system** (`.surface` / `.surface-hover` / `.accent-edge` in
  globals) — cards now have a top-down sheen, a 1px inner highlight, an
  accent-tinted top hairline, and a hover lift. Applied to StatBlock, FeatureCard,
  and the homepage stack cards in one place so the craft is consistent.
- **Tri-product signature seam** — the cyan→violet→emerald gradient hairline used
  exactly once, at the footer seam, to tie the three products together.
- Verified: tsc clean, 16/16 static, 114 kB first load (unchanged — all additions
  are server-rendered), responsive card stacking checked at 390px.

## v2.2 — improve pass
- **Mobile nav rebuilt** — replaced the clipping horizontal-scroll strip with a
  proper disclosure menu (client `components/Nav.tsx`): hamburger ↔ X morph,
  full-height sheet, Escape-to-close, scroll-lock, route-change auto-close.
- **Active-route highlighting** — nav items reflect the current path via
  `usePathname` + `aria-current="page"` (desktop and mobile).
- **Hero rebalanced** — two-column grid on `lg+`: thesis left, benchmark
  terminal anchored right (was left-weighted with dead space). Stacks on mobile.
- **NextUp everywhere** — cross-link rails added to research, services, company,
  investors, and architecture (were dead-ends). Contact stays terminal by design.
- **Fonts** — `display: "swap"` on Sora / Manrope / JetBrains Mono (no FOIT).
- Verified: tsc clean, 16/16 static, mobile menu open/close, active states,
  desktop hero, NextUp render — all via Playwright at 390px and 1440px.

## v2.1 — merged sources
- github.com/donaldfilimon/abi (verified): Apache-2.0, Zig 0.17.0-dev, 670+ commits,
  MCP server, OpenAI-compatible streaming, build.sh gate. License copy corrected
  MIT → Apache-2.0.
- MLAI-CORPORATION-WWW (corporate positioning): platform layers (Trace/Control/
  Eval/Private Runtime), 9 services, FAQ, 6 values + 4 operating principles,
  3 research tracks, 11-publication index, formal WDBX model (authority trust
  table, composite score s = σ·τ·γ·π, hash-chained audit log), founder profile
  (Founder & Systems Architect, motto, projects). Corp site reframes 295×/0.8ms/
  16.5K as targets — site follows the downgrade.

## Run
    bun install
    bun run dev          # localhost:3000
    bun run typecheck    # tsc --noEmit (passes clean)
    bun run build        # static export to out/

## Source of truth
All content lives in `lib/brand.ts`, fully typed. Every metric carries a
Provenance tag rendered by `<ProvTag/>`:

    ● measured  — reproduced on MLAI hardware; harness in repo
    ○ target    — engineering goal, not yet achieved
    ◆ reported  — figure from a cited research document

The legend renders in the footer site-wide. The /research page hosts the
WDBX/multi-persona technical-analysis figures (110ms, 90 req/s, 15 Wh/task,
GLUE/SQuAD/CodeSearchNet) tagged `reported` with methodology caveats inline;
product pages carry only `measured`/`target` numbers.

## Integrity gates
- Apple framing is fixed in `company.appleFraming`: "Built on Apple's public
  frameworks." Do not replace with partnership/investment language until an
  executed agreement is verified.
- New claims go in brand.ts with a tag, never inline in components.

## Design system
Sora (display) / Manrope (body) / JetBrains Mono (data) via next/font.
Accents: WDBX #00D4FF · ABI #7C3AED · Abbey #10B981. Ink #05070B, panel
#0A0E16, hairline borders. Reduced-motion respected; visible focus rings.
