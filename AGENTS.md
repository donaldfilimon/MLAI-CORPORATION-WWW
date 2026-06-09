# AGENTS.md — MLAI Corporation WWW

## Project Context
Production-grade website for MLAI Corporation. Built with React 19, Vite, and TailwindCSS (v4).
Server is currently a Bun-native Hono app handling WorkOS AuthKit and static file serving, with a Rust 2024 Axum migration target in `rust/server`.

## Essential Commands
- `bun install` — Install dependencies
- `bun run dev` — Start Vite dev server (frontend, port 3000)
- `bun run build` — Build production SPA
- `bun server.ts` — Start Bun-native production server (port 3001)
- `bun run check:rust` — Type-check the Rust 2024 Axum server (`cargo check -p mlai-www-server`)
- `bun run server:rust` / `./start_rust.sh` — Run the Rust 2024 Axum server target
- `./start_dev.sh` — Run both frontend and Bun backend together (recommended for current development)

## Critical Setup
- Copy `.env.example` to `.env` and fill in WorkOS credentials and session secret
- Type checking: `bun run lint` (runs `tsc --noEmit`)
- Environment: Requires Bun 1.4+ (`packageManager: bun@1.4.0`, text `bun.lock`; preferred over Node.js)

## Architecture Overview
- **Frontend**: React 19 SPA in `src/` using `react-router-dom`
- **Backend**: `server.ts` (Hono/Bun) + `server/` (session management with iron-session); Rust 2024 Axum migration target in `rust/server/` mirrors the API/static-serving surface
- **Styling**: TailwindCSS v4 (via `@tailwindcss/vite`) + custom glassmorphism and utility classes (`.glass-card`, `.container-custom`, `.container-prose`, `.section-y`, `.section-title`, etc.). **Brand = "Signal" / Indigo:** indigo primary + sky/ice secondary on slate near-black, fuchsia as a rare "trace" accent — driven by OKLCH `:root` tokens re-exposed via `@theme inline` PLUS a legacy `@theme` hex block (update both to re-skin; re-value tokens, don't restructure). `--primary-foreground` is light (indigo primary is mid-dark). Brand uses Tailwind `indigo`/`sky`/`fuchsia` ramps (do not reintroduce emerald/teal/blue/cyan). Hardcoded brand hex also lives in `HeroScene.tsx`, WDBX charts, `Docs.tsx` persona dots, `public/*.svg`, `index.html`, `manifest.webmanifest`. Reusable logo at `src/components/Logo.tsx`. Body font self-hosted Geist; Outfit/JetBrains Mono load async. Research/blog bodies support KaTeX `math` (via `Math.tsx`); detail pages share `ArticleLayout`/`ArticleSections` (`src/components/article.tsx`). Gates: `bun run lint` + `bun run test` (Vitest) + `bun run build` (regenerates the sitemap).
- **Performance**: `vite.config.ts` `manualChunks` splits heavy libs out of the shared `vendor` chunk (`tensorflow`/`motion`/`react`) so TensorFlow only loads on `/tf-pose-demo`. Keep route-isolated heavy deps out of the eager path.
- **Auth**: WorkOS AuthKit integration via `src/lib/auth.tsx`
- **State**: `UIProvider` in `src/lib/ui-context.tsx` for global modals

## Development Notes
- Uses React 19 features including `useActionState` and Server Actions
- Global UI state managed through `UIProvider` component
- Design system upgraded (Phase 2) with `.glass-card` components replacing shadcn/ui Card wrappers, modular typography scale (--text-h0 through --text-h5), and consistent glassmorphism across all pages
- Benchmark charts use custom Canvas rendering (`src/components/wdbx-benchmark/`)
- SVG icons from Lucide React
- Animation via Framer Motion
- UI quirks: `Button` supports `asChild` prop to avoid nesting bugs; `Card`, `Dialog`, `Select`, `Input` use `min-w-0` and safe text wrapping for responsive scaling; dark theme set via `:root` tokens; `.dark` class only sets `color-scheme: dark` to avoid overriding MLAI palette
- Content: single source of truth at `src/data/index.ts`, aggregating domain modules in `src/data/categories/*` (services, research, blog, team, FAQ, platform, industries). **Blog posts and research publications are data, not JSX**: each carries a `slug` + structured `body: BlogSection[]` (`{ heading?, paragraphs[], list? }`) and renders as a detail page — `BlogPost.tsx` at `/blog/:slug`, `ResearchPaper.tsx` at `/research/:slug`. Add a fully-bodied entry to the data module; don't hardcode prose in components. Per-route SEO is derived from `content` in `src/components/RouteMetadata.tsx`.
- Content claims constraint: per the sibling `abi` repo's `docs/contracts/external-claims-audit.md`, do not cite specific QPS/latency/accuracy/benchmark numbers, distributed sharding, certifications, or non-existent stacks unless a repo artifact proves them. Frame metrics as targets (see `src/data/categories/stats.ts`); ground copy in verifiable architecture (real `abi` CLI, MCP tools, WDBX stores, Abbey/Aviva/Abi routing).

## Modernization Standards
- **Zig 0.17**: WDBX benchmarks in `src/components/wdbx-benchmark/charts.ts` should reflect latest engine performance
- **Swift 6.3**: Abbey AI benchmarks should reflect latest concurrency-safe framework metrics
- **Rust 2024**: New backend work should target the `rust/server` Axum crate when migrating off Bun/Hono
- **Bun**: For legacy `server.ts`, prefer Bun APIs (`Bun.file`, `Bun.serve`) over Node.js polyfills

## Verification
- Run `bun run lint` to verify no type errors
- Run `bun run build` to verify successful production bundling
- Run `bun run check:rust` with a complete Rust toolchain to verify the Rust 2024 server
- Note: Build still shows Node `[DEP0205] module.register()` deprecation warning from Vite/tooling; does not fail build
