# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context
Production-grade marketing + private-console website for MLAI Corporation. React 19 SPA (Vite) on the frontend; a Bun-native Hono app (`server.ts`) on the backend handling WorkOS AuthKit, a protected LLM/billing API, inquiry storage, and serving the built SPA.

## Essential Commands
- `bun install` — Install dependencies (Bun 1.4+; `bun.lock` text lockfile)
- `bun run dev` — Vite dev server only, port 3000
- `bun server.ts` — Bun-native API/SPA server only, port 3001
- `./start_dev.sh` — **Run both together (use this for development)**; the Vite server proxies `/api/*` to the Bun server, so auth and all API calls are broken if only one is running
- `bun run build` — Build production SPA into `dist/`
- `bun run lint` — Type-check (`tsc --noEmit`). **This is the only automated gate — there is no test runner.** `src/__tests__/` is currently empty and `package.json` has no `test` script.

Before `bun server.ts` can serve anything useful it needs a `dist/` build (it serves `dist/index.html` as the SPA fallback and 404s otherwise).

## Architecture

### Two-process dev model (the key thing to understand)
In development, Vite (3000) serves the React app and proxies `/api/*` to the Bun Hono server (3001) — see [vite.config.ts](vite.config.ts) `server.proxy`. In production, there is one process: `server.ts` serves both the API and the static `dist/` SPA. So API/auth behavior differs only by origin, not by code path.

### Frontend (`src/`)
- React 19 SPA, routes in [src/App.tsx](src/App.tsx) via `react-router-dom` v7. Every page except `Home` is `lazy()`-loaded; all routes nest under a single `Layout`.
- Provider stack is wired in [src/main.tsx](src/main.tsx): `QueryClientProvider` (TanStack Query, 5-min `staleTime`) → `AuthProvider` → `UIProvider` → `App`.
- `AuthProvider` ([src/lib/auth.tsx](src/lib/auth.tsx)) holds client auth state, hydrated from `GET /api/auth/me`; `login`/`signup` are full-page redirects to `/api/auth/*`.
- `UIProvider` ([src/lib/ui-context.tsx](src/lib/ui-context.tsx)) owns **only** the global Inquiry modal (`openInquiry`/`closeInquiry`). Toast notifications are separate: `<Toaster />` in `App.tsx` + the `use-toast` hook.
- API calls go through typed wrappers in [src/lib/api.ts](src/lib/api.ts), not ad-hoc `fetch` (except auth redirects).
- Path alias `@/*` → `src/*` (configured in both `tsconfig.json` and `vite.config.ts`).

### Backend (`server.ts` + `server/`)
- Bun-native server: default export is `{ port, fetch }` (Bun's serve convention), **not** `serve()`. Prefer Bun APIs (`Bun.file`, `bun:sqlite`) over Node polyfills.
- Inquiries persist to a local SQLite file `inquiries.db` via `bun:sqlite` (table auto-created on boot). `POST /api/inquiries` is public + rate-limited; `GET /api/inquiries` requires a session.
- Sessions ([server/session.ts](server/session.ts)): iron-session sealed/encrypted cookie `mlai_session` (7-day TTL), no session DB. **Gotcha:** sessions are bound to client IP + User-Agent — a mismatch invalidates the session (`get()` returns null), which can surprise you behind changing proxies/networks in local testing.
- Middleware ([server/middleware.ts](server/middleware.ts)): in-memory `rateLimiter`, request-id `loggerMiddleware`, and `sessionRenewal` (re-seals the cookie on every authenticated request to extend Max-Age).
- Auth is WorkOS AuthKit: `/api/auth/login|signup|callback|me|logout|verify-user`. If `WORKOS_API_KEY`/`WORKOS_CLIENT_ID`/`SESSION_SECRET` are unset, auth routes degrade gracefully (redirect with `?error=auth_not_configured`) rather than crashing.
- Protected app API (all require a session): `/api/llm/*` (Gemini via `GEMINI_API_KEY`, with a safe scaffold fallback when unconfigured), `/api/billing/*` (Stripe payment link), `PATCH /api/profile`.

### Content data layer
Site copy is a single source of truth at [src/data/index.ts](src/data/index.ts), which aggregates per-domain modules in `src/data/categories/*` (about, platform, industries, services, research, blog, team, stats, faq) into a `content` object, with Zod schemas in [src/data/schemas.ts](src/data/schemas.ts). Edit content there, not inline in components. (Note: older docs referenced a flat `src/data/content.ts` — that file no longer exists.)

### Styling
TailwindCSS v4 via `@tailwindcss/vite` (no `tailwind.config.js`; tokens/utilities live in [src/index.css](src/index.css)). Custom design system: typography scale `--text-h00`→`--text-h5`, and utility classes `.glass-card`, `.container-custom`, `.section-title`. Dark theme is set via `:root` tokens; the `.dark` class only sets `color-scheme: dark` so it won't override the MLAI palette. Animation via Framer Motion; icons from Lucide React; primitives from `@base-ui/react` + shadcn-style wrappers in `src/components/ui/`.

## Deployment
Multi-stage [Dockerfile](Dockerfile) (`oven/bun` base) targeting Google Cloud Run; the runner serves `dist/` via `server.ts`. Cloud Run injects `PORT`. Required secrets: `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `SESSION_SECRET` (generate with `openssl rand -base64 32`); optionally `GEMINI_API_KEY`, `STRIPE_PAYMENT_LINK`, `APP_URL`/`FRONTEND_URL`. Copy `.env.example` → `.env` for local setup.

Caveats:
- The Dockerfile copies `bun.lockb*` (old binary lockfile name) but the repo ships `bun.lock` (text). Verify the lockfile actually lands in the image when changing Docker/CI.
- `vite.config.ts` inlines `process.env.GEMINI_API_KEY` into the client bundle via `define`; the server reads its own `GEMINI_API_KEY` separately. Keep production LLM keys server-side only.

## Modernization Standards
These govern the *content* of the benchmark visualizations, which mirror sibling-project releases:
- **Zig 0.17**: WDBX benchmark data in `src/components/wdbx-benchmark/charts.ts` (custom Canvas charts) should reflect latest engine performance.
- **Swift 6.3**: Abbey AI benchmarks should reflect latest concurrency-safe framework metrics.
- **Bun**: Always prefer Bun APIs over Node.js polyfills.

## Repository hygiene
- The working tree carries scratch/experiment files at the repo root — `debug_string*.ts`, `massive_content.json`, `new_publications.json`, `sidebar_block.txt`. None are imported by `src/`, `server.ts`, or the build; treat them as throwaway, not source of truth, and don't wire them into the app.
- `src/pages/TFPoseDemo.tsx` (route `/tf-pose-demo`) is the only consumer of the heavy `@tensorflow/tfjs` + `@tensorflow-models/posenet` dependencies. It's a standalone demo, not part of the marketing/console product — keep it isolated so it doesn't pull TF into the main bundle path.

## AI Tooling Sync
This repo follows the global `ai-tooling-sync` skill. `CLAUDE.md`, `AGENTS.md`, and `GEMINI.md` are kept in sync (GEMINI.md additionally `@`-imports local skills from `./skills/`). When you change durable instructions here, update the others to match.
