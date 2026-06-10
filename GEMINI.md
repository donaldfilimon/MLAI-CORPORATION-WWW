@./skills/zig-017-modernization/SKILL.md
@./skills/swift-63-modernization/SKILL.md
@./skills/ai-tooling-sync/SKILL.md
@./skills/abi-codebase-audit/SKILL.md
@./skills/abi-refactor-architecture/SKILL.md
@./skills/abi-lsp-zig-workflow/SKILL.md
@./skills/abi-goals-roadmap/SKILL.md

# MLAI Corporation WWW

## Project Context
Production-grade website for MLAI Corporation. **Next.js 15 (App Router) + React 19 + TailwindCSS v4, run on Bun** — one process serves pages and `/api/*` route handlers (WorkOS AuthKit, LLM/billing, inquiries, telemetry). The Vite SPA + Hono server and the Rust/Axum migration target are RETIRED (`.retired/`; `rust/` is inactive).

## Essential Commands
- `bun install` — Install dependencies
- `bun run dev` — Next.js dev server, port 3000 (pages + API in one process)
- `bun run build` — Sitemap + `next build`
- `bun run start` — Production `next start`, port 3000

## Critical Setup
- Copy `.env.example` to `.env` and fill in WorkOS credentials and session secret
- Type checking: `bun run lint` (runs `tsc --noEmit`)
- Environment: Requires Bun 1.4+ (`packageManager: bun@1.4.0`, text `bun.lock`; preferred over Node.js)

## Architecture Overview
- **Frontend**: Next.js 15 App Router — route files in `app/` render client view components from `src/views/` via the `app/pages-client.tsx` boundary; `react-router-dom` imports are aliased to `src/lib/router-compat.tsx` (the npm package is removed); per-route SEO from `src/lib/route-meta.ts`. NEVER recreate `src/pages/` (Pages Router collision).
- **Showcase**: cinematic surfaces under `/showcase/*` — a timeline animation engine (`src/film/engine.tsx`) renders the Brand Film (69s) / Trailer (62s) / Mega (282s) / Explainer live, narrated by Kokoro-82M neural TTS (`src/film/neural-voice.ts`, CDN dynamic import, on-device); plus the 8-board design lab (`src/design/DesignHub.tsx`). Design-system CSS vars are scoped under `.mlai-ds` (`src/design/mlai-ds-tokens.css`), never `:root`. Each surface is its own lazy chunk via `CinematicShell`. The films keep the legacy cyan→blue→violet spectrum; the Signal-indigo brand rule applies to site chrome only.
- **Backend**: Next route handlers in `app/api/*` + shared logic in `src/lib/server/` (iron-session cookie `mlai_session` unchanged; SQLite via `node:sqlite`; in-memory rate limits; WorkOS AuthKit; `ADMIN_REQUIRE_MFA` gate). Contracts identical to the retired Hono server; login/signup redirects are 307.
- **Styling**: TailwindCSS v4 (via `@tailwindcss/vite`) + custom glassmorphism and utility classes (`.glass-card`, `.container-custom`, `.container-prose`, `.section-y`, `.section-title`, etc.). **Brand = "Signal" / Indigo:** indigo primary + sky/ice secondary on slate near-black, fuchsia as a rare "trace" accent — driven by OKLCH `:root` tokens re-exposed via `@theme inline` PLUS a legacy `@theme` hex block (update both to re-skin; re-value tokens, don't restructure). `--primary-foreground` is light. Brand uses Tailwind `indigo`/`sky`/`fuchsia` ramps (do not reintroduce emerald/teal/blue/cyan). Hardcoded brand hex also lives in `HeroScene.tsx`, WDBX charts, `Docs.tsx` persona dots, `public/*.svg`, `index.html`, `manifest.webmanifest`. Reusable logo at `src/components/Logo.tsx`. Body font self-hosted Geist; Outfit/JetBrains Mono async. Research/blog bodies support KaTeX `math` (`Math.tsx`); detail pages share `ArticleLayout`/`ArticleSections` (`src/components/article.tsx`). Gates: `bun run lint` + `bun run test` (Vitest) + `bun run build` (regenerates sitemap).
- **Performance**: `vite.config.ts` `manualChunks` splits `tensorflow`/`motion`/`react` out of the shared `vendor` chunk so TensorFlow only loads on `/tf-pose-demo`.
- **Auth**: WorkOS AuthKit integration via `src/lib/auth.tsx`
- **State**: `UIProvider` in `src/lib/ui-context.tsx` for global modals
- **Content**: single source of truth at `src/data/index.ts`, aggregating domain modules in `src/data/categories/*` (now including `products`, which drives the `/products/:slug` deep-dive pages — ABI Framework + Abbey — rendered by `src/pages/Product.tsx` with KaTeX equations and interactive demos from `src/components/demos/`). **Blog posts and research publications are data, not JSX**: each carries a `slug` + structured `body: BlogSection[]` (`{ heading?, paragraphs[], list? }`) and renders as a detail page — `BlogPost.tsx` at `/blog/:slug`, `ResearchPaper.tsx` at `/research/:slug`. Add a fully-bodied data entry; don't hardcode prose in components. Per-route SEO derives from `content` in `src/components/RouteMetadata.tsx`.
- **Content claims constraint**: per the sibling `abi` repo's `docs/contracts/external-claims-audit.md`, do not cite specific QPS/latency/accuracy/benchmark numbers, sharding, certifications, or non-existent stacks unless a repo artifact proves them. Frame metrics as targets (`src/data/categories/stats.ts`); ground copy in verifiable architecture (real `abi` CLI, MCP tools, WDBX stores, Abbey/Aviva/Abi routing).

## Modernization Standards
- **Zig 0.17**: WDBX benchmarks in `src/components/wdbx-benchmark/charts.ts` should reflect latest engine performance
- **Swift 6.3**: Abbey AI benchmarks should reflect latest concurrency-safe framework metrics
- **Bun**: For legacy `server.ts`, prefer Bun APIs (`Bun.file`, `Bun.serve`) over Node.js polyfills

## AI Tooling Sync
This project follows the global `ai-tooling-sync` skill. Durable instructions are synced via `GEMINI.md`.
Local skills are stored in `./skills/`.
