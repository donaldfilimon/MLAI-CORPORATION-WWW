<div align="center">
<img width="1200" height="475" alt="MLAI Corporation banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# MLAI Corporation WWW

Production-grade marketing and private-console website for MLAI Corporation. The active stack is **Next.js 15 App Router + React 19 + TailwindCSS v4**, served as one Bun-managed application with `/api/*` route handlers in the same process.

The previous Vite SPA, Hono server, and Rust/Axum migration plan are abandoned. Do not extend or restore them; active work belongs in the TypeScript/TSX Next.js surface.

## Tech Stack

- **Frontend:** Next.js 15 App Router, React 19, TailwindCSS v4, Framer Motion, Lucide React.
- **Backend:** Next route handlers in `app/api/*`, shared server utilities in `src/lib/server/*`.
- **Runtime and package manager:** Bun 1.4+ with the checked-in `bun.lock`.
- **Auth:** WorkOS AuthKit with encrypted `mlai_session` cookies.
- **Storage:** SQLite via `node:sqlite` for inquiries and privacy-respecting telemetry.
- **Content:** Structured TypeScript data in `src/data/categories/*`.

## Project Structure

- `app/` - route files, metadata, providers, and API route handlers.
- `src/views/` - client page implementations rendered through each route's `app/<route>/client.tsx` boundary.
- `src/components/` - shared UI, article shells, demos, charts, and layout primitives.
- `src/lib/` - typed API wrappers, router compatibility, telemetry, auth, and server helpers.
- `src/data/` - single source of truth for marketing, blog, research, team, product, and FAQ content.
- `src/film/`, `src/trailer/`, `src/mega/`, `src/explainer/` - the cinematic `/showcase/*` surfaces: a shared timeline engine and scene library in `src/film/`, plus three alternate cuts built on it.
- `src/design/` - the `/showcase/design` design lab, lazy-loaded one board at a time.
- `public/` - static assets, sitemap, mirrored WDBX docs, and research PDFs.
- `docs/` - operator runbooks and project specifications.

## Setup

```bash
bun install
cp .env.example .env
```

Fill `.env` with WorkOS credentials and a `SESSION_SECRET` of at least 32 characters. Optional server-only values include `GEMINI_API_KEY`, `STRIPE_PAYMENT_LINK`, `ADMIN_EMAILS`, and `ADMIN_REQUIRE_MFA`.

## Development Commands

```bash
bun run dev       # Next dev server on http://localhost:3000
bun run lint      # TypeScript check with tsc --noEmit
bun run test      # Vitest suite
bun run build     # Regenerate sitemap, then next build
bun run start     # Serve the production build on port 3000
bun run smoke     # API smoke script
bun run crawl     # Link crawl script
bun run og        # Regenerate raster brand assets (og-image.png + PNG icons)
bun run design-sync:css  # Compile src/index.css for the design-sync converter
```

Run `bun run lint`, `bun run test`, and `bun run build` before production-impacting changes.

## Content and Claims

Edit public copy in `src/data/categories/*`, not inline in page components. Blog posts and research papers require `slug` values and fully populated structured bodies so detail pages, metadata, and sitemap generation stay in sync.

External collateral must not cite unsupported benchmark, security, compliance, distributed-sharding, or scaling claims. Frame unverified metrics as targets and ground copy in implemented architecture.

## Feeds, SEO, and Social Cards

- `sitemap.xml` and `llms.txt` are both generated from the content layer by `bun run sitemap` (also the first step of `bun run build`) — neither can drift from the real route set.
- `feed.xml` is an RSS 2.0 feed of every blog post + research publication, served at request time from the same content layer (`src/lib/feed.ts`).
- Individual blog posts, research papers, team profiles, and product pages each get their own branded Open Graph image (title-aware, generated at build time) instead of sharing one generic card — see the `opengraph-image.tsx` file next to each dynamic route.
- Each of those detail pages also carries JSON-LD (`BlogPosting`/`ScholarlyArticle`/`Person`/`SoftwareApplication`) for rich results.

## Administrative Access

Admin reads such as `GET /api/inquiries` and `GET /api/telemetry/summary` require a valid session and `ADMIN_EMAILS` allowlist membership. When `ADMIN_REQUIRE_MFA=true`, they also require at least one enrolled WorkOS MFA factor and fail closed if factor verification is unavailable. See `docs/mfa-workos-runbook.md`.

Write endpoints are protected on two independent axes. In-memory fixed-window rate limits cap how *many* requests a client IP can make, and `src/lib/server/body-limit.ts` caps how *large* each body may be — Next 15 route handlers ship no default body cap, so every POST reads through it and returns `413` past its per-route limit (4 KB telemetry and checkout, 16 KB profile, 32 KB inquiries, 64 KB CSP reports, 128 KB LLM chat). Give any new POST route a cap sized to its real payload.

## Deployment

The Dockerfile targets Google Cloud Run, runs as a non-root user, and executes `next start` on the injected `PORT`. Required production secrets are `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, and `SESSION_SECRET` (≥32 characters). `APP_URL` is required — it is the OAuth redirect base, and the deploy fails fast without it. Leave `FRONTEND_URL` **unset** unless it genuinely differs; when set it must share `APP_URL`'s host, or the OAuth state cookie never comes back and every login fails with `invalid_state`. `.github/workflows/ci.yml` runs lint/test/build on every push and PR to `main`, and the Cloud Run deploy is gated on it — `deploy-cloudrun.yml` triggers on CI's `workflow_run` and deploys the exact SHA CI validated, only for a successful push from this repository.
