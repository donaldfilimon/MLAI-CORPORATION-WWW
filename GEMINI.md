@./skills/zig-017-modernization/SKILL.md
@./skills/swift-63-modernization/SKILL.md
@./skills/ai-tooling-sync/SKILL.md
@./skills/abi-codebase-audit/SKILL.md
@./skills/abi-refactor-architecture/SKILL.md
@./skills/abi-lsp-zig-workflow/SKILL.md
@./skills/abi-goals-roadmap/SKILL.md

# MLAI Corporation WWW

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
- **Styling**: TailwindCSS v4 (via `@tailwindcss/vite`) + custom glassmorphism and utility classes (`.glass-card`, `.container-custom`, `.section-title`, etc.). **Brand = "Signal" (2026 redesign):** emerald primary + teal secondary on neutral near-black, driven by OKLCH semantic tokens in `:root` re-exposed via `@theme inline` (re-value tokens to re-skin, don't restructure). Brand uses Tailwind `emerald`/`teal` ramps (not `blue`/`cyan`). Reusable logo at `src/components/Logo.tsx`. Body font self-hosted Geist; Outfit/JetBrains Mono async from `index.html`.
- **Performance**: `vite.config.ts` `manualChunks` splits `tensorflow`/`motion`/`react` out of the shared `vendor` chunk so TensorFlow only loads on `/tf-pose-demo`.
- **Auth**: WorkOS AuthKit integration via `src/lib/auth.tsx`
- **State**: `UIProvider` in `src/lib/ui-context.tsx` for global modals
- **Content**: single source of truth at `src/data/index.ts`, aggregating domain modules in `src/data/categories/*`. **Blog posts and research publications are data, not JSX**: each carries a `slug` + structured `body: BlogSection[]` (`{ heading?, paragraphs[], list? }`) and renders as a detail page — `BlogPost.tsx` at `/blog/:slug`, `ResearchPaper.tsx` at `/research/:slug`. Add a fully-bodied data entry; don't hardcode prose in components. Per-route SEO derives from `content` in `src/components/RouteMetadata.tsx`.
- **Content claims constraint**: per the sibling `abi` repo's `docs/contracts/external-claims-audit.md`, do not cite specific QPS/latency/accuracy/benchmark numbers, sharding, certifications, or non-existent stacks unless a repo artifact proves them. Frame metrics as targets (`src/data/categories/stats.ts`); ground copy in verifiable architecture (real `abi` CLI, MCP tools, WDBX stores, Abbey/Aviva/Abi routing).

## Modernization Standards
- **Zig 0.17**: WDBX benchmarks in `src/components/wdbx-benchmark/charts.ts` should reflect latest engine performance
- **Swift 6.3**: Abbey AI benchmarks should reflect latest concurrency-safe framework metrics
- **Rust 2024**: New backend migration work should target the `rust/server` Axum crate when migrating off Bun/Hono
- **Bun**: For legacy `server.ts`, prefer Bun APIs (`Bun.file`, `Bun.serve`) over Node.js polyfills

## AI Tooling Sync
This project follows the global `ai-tooling-sync` skill. Durable instructions are synced via `GEMINI.md`.
Local skills are stored in `./skills/`.
