@./skills/ai-tooling-sync/SKILL.md

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
- `bun run crawl` — Real-browser link-integrity crawl (`scripts/crawl-links.mjs`), needs a dev server or `BASE_URL=`
- `bun run smoke` — API contract matrix; `SMOKE_WRITE=1` adds the inquiry write, `SMOKE_RATELIMIT=1` adds the csp-report 429 burst (oversize-body `413` cases run by default)

## Critical Setup
- Copy `.env.example` to `.env`
- Required production secrets: `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `SESSION_SECRET`
- Admin reads use `ADMIN_EMAILS`; `ADMIN_REQUIRE_MFA=true` adds fail-closed WorkOS factor enforcement
- Requires Bun 1.4+ (`packageManager: bun@1.4.0`)

## Architecture Overview
- **Frontend**: App Router files in `app/` render client views from `src/views/` via per-route `app/<route>/client.tsx` re-exports. Never recreate `src/pages/`. `client.tsx` is a plain re-export for standard routes, but a `next/dynamic(..., { ssr: false })` wrapper for browser-only views (`/showcase/*`, `/tf-pose-demo`).
- **Routing register**: every route needs a `routeMetadata` entry in `src/lib/route-meta.ts`, but it belongs in `scripts/generate-sitemap.ts` **only if it is not `noindex`**. The six `noindex: true` routes (`/login`, `/signup`, `/console`, `/profile`, `/financial-model`, `/tf-pose-demo`) are deliberately absent from the sitemap — that is the invariant, not drift.
- **Backend**: Next route handlers in `app/api/*`; shared server logic in `src/lib/server/` for sessions, SQLite, WorkOS, rate limits, LLM scaffolding, POST body caps (`body-limit.ts`), and the shared AuthKit redirect (`authkit-entry.ts`, behind both `/api/auth/login` and `/api/auth/signup` — they differ only in `screenHint`, so don't re-fork them and split the rate-limit bucket and `getReturnTo` guard).
- **POST body caps**: Next 15 route handlers have **no** default body cap (`bodyParser` is Pages Router only; `bodySizeLimit` is Server Actions), and Cloud Run's ceiling is 32 MB — so every POST reads through `src/lib/server/body-limit.ts`. Rate limiting caps request COUNT, this caps request SIZE; both are needed. `Content-Length` is a cheap early exit only (chunked requests omit it); the streaming byte counter is the guarantee. `readJsonLimited<T>` returns `T | Response` (413 oversize / 400 unparseable / parsed value), narrowed with `instanceof Response`; `T` is an assertion, not validation, so routes still validate fields. Aborted reads collapse to `null` instead of throwing — that is what keeps csp-report from ever 5xx-ing, pinned in `body-limit.test.ts`. Caps: 4 KB telemetry + billing/checkout, 16 KB profile, 32 KB inquiries, 64 KB csp-report, 128 KB llm/chat. Size a new route's cap to its real payload.
- **Auth/Admin**: `mlai_session` is an iron-session cookie. Admin reads (`GET /api/inquiries`, `GET /api/telemetry/summary`) require session + `ADMIN_EMAILS`; MFA is enabled by `ADMIN_REQUIRE_MFA=true`.
- **Content**: `src/data/index.ts` aggregates `src/data/categories/*`. Blog and research entries are structured data with slugs and full bodies; do not hardcode long-form prose in components.
- **Two component layers**: `src/components/ui/` holds shadcn-style primitives; `src/components/site/` holds 24 section-level blocks (Section, CardPanel, StatBlock, ProvTag, FeatureCard, DataTable, …) built on them. Build page sections from `site/`. They hold no content (all props), require a provenance tag on figures (`measured | target | reported`), and carry no router dependency. Most take `accent?: "wdbx" | "abi" | "abbey"` → cyan/violet/emerald — **not** the persona axis, where Abbey is emerald, Aviva violet, Abi cyan.
- **Do not collapse `FAQ.tsx`/`Stats.tsx` onto `FAQList`/`StatBlock`** — they overlap in subject, not job (animated Accordion + sticky layout; count-up + section-level target framing). Both pairs coexist deliberately. Never lift `src/data/categories/stats.ts` figures (`295x`, `0.8ms`, `16.5k`) into a standalone card: they are publishable only inside that section's explicit target framing.
- **Design-sync barrel**: `src/components/ds.ts` is bundled for claude.ai/design. Nothing in it may transitively import `react-router-dom`/`next/*` — Next's client runtime reads `process.env.__NEXT_*` at module scope and throws in a standalone bundle, killing every export. `Logo` is excluded for this reason; `LogoMark` lives in its own router-free module.
- **Styling**: TailwindCSS v4 tokens/utilities live in `src/index.css`. Reuse `.container-custom`, `.container-prose`, `.section-y`, `.section-title`, `.glass-card`, and `.label-chip`.
- **Brand**: "Lab" system: cyan primary, blue/sky secondary, near-black ink canvas (`#05070d`), with violet/emerald/amber as fixed persona colors and a serif (Spectral) display face. The indigo "Signal" identity is retired; do not reintroduce indigo/fuchsia for brand chrome.
- **Showcase**: `/showcase/*` surfaces use lazy client chunks and cinematic engines under `src/film/`, `src/trailer/`, `src/mega/`, and `src/explainer/` — all four consume `src/film/`'s timeline engine and shared scenes, hosted by `src/components/CinematicShell.tsx`. `/showcase/design` renders the design lab in `src/design/` — real imported source, not one of the three similarly-named design-sync dirs (`.design-sync/` config+notes, partially tracked; gitignored `ds-bundle/` synced output; gitignored `.ds-sync/` npm staging, which also holds the Playwright install `bun run crawl` falls back to). Its `mlai-ds-tokens.css` is scoped under a `.mlai-ds` wrapper so it never leaks into `:root`, and `src/index.css` stays the canonical token source.
- **Neural voice**: `src/film/neural-voice.ts` (Kokoro-82M) must stay behind its lazy CDN dynamic import so it never enters the server bundle or the initial marketing chunk. Gesture-gated, honors `prefers-reduced-motion`, degrades to a silent caption.
- **Security headers / CSP**: the hand-curated CSP in `next.config.ts` reports violations to `app/api/csp-report/route.ts` via **both** `report-to csp-endpoint` and `report-uri` — keep both (Safari and older Firefox implement only `report-uri`). That endpoint logs to stdout and returns 204; it must **never** write to `telemetry_events`, whose contract is allowlisted event + pathname + timestamp with no identifiers. Unauthenticated on purpose, which is safe only because it is **rate-limited 60s/60 per client IP** (same window as `/api/telemetry`) — keep the guard as the handler's first statement, before the body read, and don't retune it to the tighter `inquiries` window. Extend the specific directive for a new origin; never widen to a bare `https:` wildcard.
- **Performance**: Keep heavy route-specific dependencies isolated, especially TensorFlow on `/tf-pose-demo`.

## Verification
Run `bun run lint`, `bun run test`, and `bun run build` before production-impacting changes. Build regenerates `public/sitemap.xml`.

## Content Claims Constraint
External copy must not cite unsupported QPS, latency, accuracy, energy, benchmark, security, compliance, distributed-sharding, or scaling claims. Frame unverified metrics as targets and ground copy in implemented architecture.

`docs/master-reference.md` is the reconciled cross-project fact sheet and carries the provenance discipline this rule depends on: every metric is tagged **● measured** / **○ target** / **◆ reported**, and the three are never conflated. It also pins the standing Apple rule — only "Built on Apple's public frameworks (Metal, Accelerate, Core ML)" framing, no partnership or endorsement claim. Carry the tags forward when moving a figure into site copy. Tone rules live in `docs/voice-guidelines.md`.

## AI Tooling Sync
This project follows the global `ai-tooling-sync` skill. Keep `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, and README guidance aligned when changing durable instructions.
