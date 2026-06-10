@./skills/zig-017-modernization/SKILL.md
@./skills/swift-63-modernization/SKILL.md
@./skills/ai-tooling-sync/SKILL.md
@./skills/abi-codebase-audit/SKILL.md
@./skills/abi-refactor-architecture/SKILL.md
@./skills/abi-lsp-zig-workflow/SKILL.md
@./skills/abi-goals-roadmap/SKILL.md

# MLAI Corporation WWW

## Project Context
Production-grade website for MLAI Corporation. **Next.js 15 App Router + React 19 + TailwindCSS v4, run on Bun** — one process serves pages and `/api/*` route handlers for WorkOS AuthKit, LLM/billing, inquiries, telemetry, and admin reads.

The previous Vite SPA, Hono server, and Rust/Axum migration plan are abandoned. Do not extend or restore those stacks; active work belongs in TypeScript/TSX under `app/` and `src/`.

## Essential Commands
- `bun install` — Install dependencies with the checked-in `bun.lock`
- `bun run dev` — Next.js dev server on port 3000
- `bun run lint` — Type-check with `tsc --noEmit`
- `bun run test` — Vitest suite
- `bun run build` — Regenerate sitemap, then `next build`
- `bun run start` — Production `next start` on port 3000

## Critical Setup
- Copy `.env.example` to `.env`
- Required production secrets: `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `SESSION_SECRET`
- Admin reads use `ADMIN_EMAILS`; `ADMIN_REQUIRE_MFA=true` adds fail-closed WorkOS factor enforcement
- Requires Bun 1.4+ (`packageManager: bun@1.4.0`)

## Architecture Overview
- **Frontend**: App Router files in `app/` render client views from `src/views/` via `app/pages-client.tsx`. Never recreate `src/pages/`.
- **Backend**: Next route handlers in `app/api/*`; shared server logic in `src/lib/server/` for sessions, SQLite, WorkOS, rate limits, and LLM scaffolding.
- **Auth/Admin**: `mlai_session` is an iron-session cookie. Admin reads (`GET /api/inquiries`, `GET /api/telemetry/summary`) require session + `ADMIN_EMAILS`; MFA is enabled by `ADMIN_REQUIRE_MFA=true`.
- **Content**: `src/data/index.ts` aggregates `src/data/categories/*`. Blog and research entries are structured data with slugs and full bodies; do not hardcode long-form prose in components.
- **Styling**: TailwindCSS v4 tokens/utilities live in `src/index.css`. Reuse `.container-custom`, `.container-prose`, `.section-y`, `.section-title`, `.glass-card`, and `.label-chip`.
- **Brand**: Signal/Indigo system: indigo primary, sky/ice secondary, slate near-black canvas, fuchsia only as a rare trace accent. Do not reintroduce emerald/teal/cyan site chrome.
- **Showcase**: `/showcase/*` surfaces use lazy client chunks and cinematic engines under `src/film/`, `src/trailer/`, `src/mega/`, and `src/explainer/`.
- **Performance**: Keep heavy route-specific dependencies isolated, especially TensorFlow on `/tf-pose-demo`.

## Verification
Run `bun run lint`, `bun run test`, and `bun run build` before production-impacting changes. Build regenerates `public/sitemap.xml`.

## Content Claims Constraint
External copy must not cite unsupported QPS, latency, accuracy, energy, benchmark, security, compliance, distributed-sharding, or scaling claims. Frame unverified metrics as targets and ground copy in implemented architecture.

## AI Tooling Sync
This project follows the global `ai-tooling-sync` skill. Keep `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, and README guidance aligned when changing durable instructions.
