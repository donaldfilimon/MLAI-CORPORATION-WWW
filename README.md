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
- `src/views/` - client page implementations rendered through `app/pages-client.tsx`.
- `src/components/` - shared UI, article shells, demos, charts, and layout primitives.
- `src/lib/` - typed API wrappers, router compatibility, telemetry, auth, and server helpers.
- `src/data/` - single source of truth for marketing, blog, research, team, product, and FAQ content.
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
```

Run `bun run lint`, `bun run test`, and `bun run build` before production-impacting changes.

## Content and Claims

Edit public copy in `src/data/categories/*`, not inline in page components. Blog posts and research papers require `slug` values and fully populated structured bodies so detail pages, metadata, and sitemap generation stay in sync.

External collateral must not cite unsupported benchmark, security, compliance, distributed-sharding, or scaling claims. Frame unverified metrics as targets and ground copy in implemented architecture.

## Administrative Access

Admin reads such as `GET /api/inquiries` and `GET /api/telemetry/summary` require a valid session and `ADMIN_EMAILS` allowlist membership. When `ADMIN_REQUIRE_MFA=true`, they also require at least one enrolled WorkOS MFA factor and fail closed if factor verification is unavailable. See `docs/mfa-workos-runbook.md`.

## Deployment

The Dockerfile targets Google Cloud Run and runs `next start` on the injected `PORT`. Required production secrets are `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, and `SESSION_SECRET`; set `APP_URL` and `FRONTEND_URL` to the deployed origin.
