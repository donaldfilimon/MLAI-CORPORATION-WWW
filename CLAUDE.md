# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context
Production-grade marketing + private-console website for MLAI Corporation. React 19 SPA (Vite) on the frontend; a Bun-native Hono app (`server.ts`) currently handles WorkOS AuthKit, protected LLM/billing APIs, inquiry storage, and serving the built SPA. A Rust 2024 Axum migration target now lives in `rust/server` and mirrors that API/static-serving surface.

## Essential Commands
- `bun install` — Install dependencies (Bun 1.4+; `bun.lock` text lockfile)
- `bun run dev` — Vite dev server only, port 3000
- `bun server.ts` — Bun-native API/SPA server only, port 3001
- `./start_dev.sh` — **Run both together (use this for development)**; the Vite server proxies `/api/*` to the Bun server, so auth and all API calls are broken if only one is running
- `bun run build` — Build production SPA into `dist/`. **Runs `bun run sitemap` first** (so detail-page URLs never drift), then `vite build`.
- `bun run lint` — Type-check (`tsc --noEmit`); the primary frontend gate.
- `bun run test` — Vitest smoke suite ([src/__tests__/content.test.ts](src/__tests__/content.test.ts)): validates the content against the Zod schema and asserts every blog/research/team slug is unique + URL-safe with a non-empty body. Single file: `bunx vitest run src/__tests__/content.test.ts`.
- `bun run sitemap` — Regenerate `public/sitemap.xml` from the content layer ([scripts/generate-sitemap.ts](scripts/generate-sitemap.ts)) — every indexable static route + blog/research/team detail slug.
- `bun run check:rust` — Type-check the Rust 2024 Axum server (`cargo check -p mlai-www-server`; requires a complete Rust toolchain).
- `bun run server:rust` / `./start_rust.sh` — Run the Rust 2024 Axum server target after building the SPA.

Before `bun server.ts` can serve anything useful it needs a `dist/` build (it serves `dist/index.html` as the SPA fallback and 404s otherwise).

## Architecture

### Two-process dev model (the key thing to understand)
In development, Vite (3000) serves the React app and proxies `/api/*` to the Bun Hono server (3001) — see [vite.config.ts](vite.config.ts) `server.proxy`. In production, there is one process: `server.ts` serves both the API and the static `dist/` SPA. So API/auth behavior differs only by origin, not by code path.

### Frontend (`src/`)
- React 19 SPA, routes in [src/App.tsx](src/App.tsx) via `react-router-dom` v7. Every page except `Home` is `lazy()`-loaded; all routes nest under a single `Layout`. A catch-all `*` route renders [src/pages/NotFound.tsx](src/pages/NotFound.tsx); the founder profile is `/team/:slug` ([src/pages/FounderProfile.tsx](src/pages/FounderProfile.tsx)).
- Provider stack is wired in [src/main.tsx](src/main.tsx): `QueryClientProvider` (TanStack Query, 5-min `staleTime`) → `AuthProvider` → `UIProvider` → `App`.
- `AuthProvider` ([src/lib/auth.tsx](src/lib/auth.tsx)) holds client auth state, hydrated from `GET /api/auth/me`; `login`/`signup` are full-page redirects to `/api/auth/*`.
- `UIProvider` ([src/lib/ui-context.tsx](src/lib/ui-context.tsx)) owns **only** the global Inquiry modal (`openInquiry`/`closeInquiry`). Toast notifications are separate: `<Toaster />` in `App.tsx` + the `use-toast` hook.
- API calls go through typed wrappers in [src/lib/api.ts](src/lib/api.ts), not ad-hoc `fetch` (except auth redirects).
- Path alias `@/*` → `src/*` (configured in both `tsconfig.json` and `vite.config.ts`).

### Backend (`server.ts` + `server/`)
- Bun-native server: default export is `{ port, fetch }` (Bun's serve convention), **not** `serve()`. Prefer Bun APIs (`Bun.file`, `bun:sqlite`) over Node polyfills while this path remains active.
- Inquiries persist to a local SQLite file `inquiries.db` via `bun:sqlite` (table auto-created on boot). `POST /api/inquiries` is public + rate-limited; `GET /api/inquiries` requires a session.
- Sessions ([server/session.ts](server/session.ts)): iron-session sealed/encrypted cookie `mlai_session` (7-day TTL), no session DB. **Gotcha:** sessions are bound to client IP + User-Agent — a mismatch invalidates the session (`get()` returns null), which can surprise you behind changing proxies/networks in local testing.
- Middleware ([server/middleware.ts](server/middleware.ts)): in-memory `rateLimiter`, request-id `loggerMiddleware`, and `sessionRenewal` (re-seals the cookie on every authenticated request to extend Max-Age).
- Auth is WorkOS AuthKit: `/api/auth/login|signup|callback|me|logout|verify-user`. If `WORKOS_API_KEY`/`WORKOS_CLIENT_ID`/`SESSION_SECRET` are unset, auth routes degrade gracefully (redirect with `?error=auth_not_configured`) rather than crashing.
- Protected app API (all require a session): `/api/llm/*` (Gemini via `GEMINI_API_KEY`, with a safe scaffold fallback when unconfigured), `/api/billing/*` (Stripe payment link), `PATCH /api/profile`.

### Rust 2024 backend target (`rust/server`)
- `rust/server` is an Axum + Tokio + SQLx SQLite implementation intended to replace `server.ts` incrementally.
- It mirrors WorkOS AuthKit redirects/callbacks, private encrypted cookie sessions, rate-limited inquiry writes, protected LLM/billing/profile routes, and static `dist/` SPA serving.
- Use `Dockerfile.rust` for Rust server container experiments. Keep endpoint response shapes compatible with `src/lib/api.ts` while migrating.

### Content data layer
Site copy is a single source of truth at [src/data/index.ts](src/data/index.ts), which aggregates per-domain modules in `src/data/categories/*` (about, platform, industries, services, research, blog, team, stats, faq) into a `content` object, with Zod schemas in [src/data/schemas.ts](src/data/schemas.ts). Edit content there, not inline in components. (Note: older docs referenced a flat `src/data/content.ts` — that file no longer exists.)

- **Long-form content (blog + research) is data, not JSX.** Both `blog` and `research.publications` items carry a `slug` and a structured `body: BlogSection[]` (shared `BlogSectionSchema` of `{ heading?, paragraphs[], list?, math? }`). `math` is an array of LaTeX strings rendered as KaTeX block equations (via [src/components/Math.tsx](src/components/Math.tsx); KaTeX CSS imported in `main.tsx`). To add an article/paper, append a fully-bodied entry to the data module; do not hardcode prose in a component. List cards (`Blog.tsx`, `Research.tsx`, `Home.tsx`) link by `slug`.
- **The detail pages share one shell.** [BlogPost.tsx](src/pages/BlogPost.tsx) (`/blog/:slug`), [ResearchPaper.tsx](src/pages/ResearchPaper.tsx) (`/research/:slug`), and the founder profile all render through [src/components/article.tsx](src/components/article.tsx): `ArticleLayout` (full reading shell), `ArticleSections` (the heading/paragraph/list/math body renderer), and `ArticleNotFound` (in-page 404). Research/blog tag→class colors live in [src/lib/tag-colors.ts](src/lib/tag-colors.ts), not inline.
- **Per-route SEO is data-derived.** [src/components/RouteMetadata.tsx](src/components/RouteMetadata.tsx) maps static paths to `<title>`/description and derives metadata for `/blog/:slug`, `/research/:slug`, and `/team/:slug` from the matching `content` entry. Unknown paths and invalid slugs resolve to a `noindex` 404 meta (not the default org meta). New indexable routes need an entry here.
- **Content claims are constrained.** Per the sibling `abi` repo's `docs/contracts/external-claims-audit.md`, external collateral (this site included) must NOT cite specific QPS/latency/accuracy/energy/model-benchmark numbers, distributed sharding, AES/RBAC, regulatory certifications, or non-existent stacks unless a repo artifact proves them. Frame metrics as **targets/goals** (as `src/data/categories/stats.ts` already does) and ground new copy in verifiable architecture (the real `abi` CLI, MCP tools, WDBX stores, Abbey/Aviva/Abi persona routing).

### Styling
TailwindCSS v4 via `@tailwindcss/vite` (no `tailwind.config.js`; tokens/utilities live in [src/index.css](src/index.css)). Custom design system: typography scale `--text-h0`→`--text-h5` (Major-Third), and utility classes `.container-custom` (max-w-7xl page width), `.container-prose` (~68ch reading measure), `.section-y` (responsive vertical rhythm `py-20 md:py-24 lg:py-28`), `.section-title`, `.glass-card`, `.label-chip`. Dark theme is set via `:root` tokens; the `.dark` class only sets `color-scheme: dark` so it won't override the MLAI palette. Animation via Framer Motion; icons from Lucide React; primitives from `@base-ui/react` + shadcn-style wrappers in `src/components/ui/`.

- **Brand = "Signal" / Indigo.** **Indigo primary** + **sky/ice secondary** on a slate near-black canvas; **fuchsia** is a rare "trace" accent. (Palette history: blue/cyan → emerald/teal → indigo/sky — do **not** reintroduce emerald/teal/blue/cyan for brand color.) Color is driven by OKLCH semantic tokens in `:root` (`--primary: oklch(0.58 0.18 270)`, `--accent`, `--ring`, `--background`, …) re-exposed to Tailwind via `@theme inline` (shadcn Tailwind-v4 structure). There is **also** a legacy `@theme` hex block (`--color-primary: #6366f1`, `--color-bg: #0a0b12`, …) driving `bg-bg`/`text-text-dim`/`bg-primary`; **update both on a re-skin.** **Re-value tokens to re-skin; don't restructure the plumbing.** `--primary-foreground` is **light** (the indigo primary is mid-dark, L≈0.58) to keep ≥4.5:1 WCAG AA.
- **Components use Tailwind's `indigo`/`sky`/`fuchsia` ramps.** Migrate a re-skin with `sed 's/<old>-/<new>-/g'` over `src/` (BSD sed has no `\b` — use plain substrings). Hardcoded brand hex/rgb lives in the 3D hero glow (`HeroScene.tsx`), WDBX charts (`Dashboard.tsx`/`BarChart.tsx`: `WDBX_COLOR`), the persona accent dots in `Docs.tsx`, the SVG assets (`public/*.svg`), `index.html` (theme-color/mask-icon), and `manifest.webmanifest` — the utility-class sed misses these, so update them by hand.
- **Glass depth** is unified: both `.glass-card` (utility) and the shadcn `Card variant="glass"` ([src/components/ui/card.tsx](src/components/ui/card.tsx)) use a 1px inset top-edge highlight + indigo hover ring + lift. Keep them in sync if you tune one.
- **Logo/wordmark is a reusable component** ([src/components/Logo.tsx](src/components/Logo.tsx)) — node-graph mark on an indigo→sky gradient, used by Navbar + Footer + Login. Don't re-inline logo markup.
- **Fonts:** body/sans is self-hosted **Geist** (`@fontsource-variable/geist`); display **Outfit** + mono **JetBrains Mono** load async (non-render-blocking print→all swap) from `index.html`. Don't re-add a render-blocking Google Fonts `@import` in CSS.

## Deployment
Multi-stage [Dockerfile](Dockerfile) (`oven/bun` base) targeting Google Cloud Run; the runner serves `dist/` via `server.ts`. `Dockerfile.rust` builds the Vite SPA and the Rust 2024 Axum server. Cloud Run injects `PORT`. Required secrets: `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `SESSION_SECRET` (generate with `openssl rand -base64 32`); optionally `GEMINI_API_KEY`, `STRIPE_PAYMENT_LINK`, `APP_URL`/`FRONTEND_URL`, `DATABASE_URL`. Copy `.env.example` → `.env` for local setup.

Caveats:
- `vite.config.ts` should not inline server-only LLM secrets into the client bundle; the server reads its own `GEMINI_API_KEY` separately. Keep production LLM keys server-side only.

## Modernization Standards
These govern the *content* of the benchmark visualizations, which mirror sibling-project releases:
- **Zig 0.17**: WDBX benchmark data in `src/components/wdbx-benchmark/charts.ts` (custom Canvas charts) should reflect latest engine performance.
- **Swift 6.3**: Abbey AI benchmarks should reflect latest concurrency-safe framework metrics.
- **Rust 2024**: New backend migration work should target the Axum crate in `rust/server`.
- **Bun**: For the legacy Bun server path, prefer Bun APIs over Node.js polyfills.

## Repository hygiene
- The working tree periodically accumulates rotating scratch/experiment files at the repo root (`*.json`/`*.txt`/`debug_*.ts` — e.g. past ones like `accent_usage.txt`, `metadata.json`, `massive_content.json` that have since been removed). None are imported by `src/`, `server.ts`, or the build — verify with a quick `grep` before trusting any root-level scratch file; treat them as throwaway, not source of truth, and don't wire them into the app.
- `src/pages/TFPoseDemo.tsx` (route `/tf-pose-demo`) is the only consumer of the heavy `@tensorflow/tfjs` + `@tensorflow-models/posenet` dependencies. It's a standalone demo, not part of the marketing/console product — keep it isolated so it doesn't pull TF into the main bundle path.

## AI Tooling Sync
This repo follows the global `ai-tooling-sync` skill. `CLAUDE.md`, `AGENTS.md`, and `GEMINI.md` are kept in sync (GEMINI.md additionally `@`-imports local skills from `./skills/`). When you change durable instructions here, update the others to match.
