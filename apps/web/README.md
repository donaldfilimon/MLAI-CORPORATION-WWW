<div align="center">
<img width="1200" height="475" alt="MLAI Corporation banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Quesar by MLAI

This application lives at `apps/web/` in the MLAI integration repository. Run
app-local commands from this directory or use `bun run check:web` at the
repository root; web-specific OpenTofu also lives here under `infra/`.

Production website and invite-only private AI operations console for **Quesar
by MLAI** at `quesar.cloud`. The active stack is **Next.js 15 App Router + React
19 + TailwindCSS v4**, served as one Bun-managed application with `/api/*`
route handlers in the same process.

The previous Vite SPA, Hono server, and Rust/Axum migration plan are abandoned. Do not extend or restore them; active work belongs in the TypeScript/TSX Next.js surface.

## Tech Stack

- **Frontend:** Next.js 15 App Router, React 19, TailwindCSS v4, Framer Motion, Lucide React.
- **Backend:** Next route handlers in `app/api/*`, shared server utilities in `src/lib/server/*`.
- **Runtime and package manager:** Bun 1.4+ with the checked-in `bun.lock`.
- **Auth:** WorkOS AuthKit with active membership in one invited organization and encrypted `mlai_session` cookies.
- **Generation:** Gemini 3.7 Flash through an authenticated Cloudflare AI Gateway with payload logging and caching disabled.
- **Storage:** PostgreSQL on regional-HA Cloud SQL for inquiries, allowlisted telemetry, consent, encrypted conversation audits, and access events.
- **Audit encryption:** Per-record AES-256-GCM data keys wrapped by Google Cloud KMS; user IDs are HMAC-pseudonymized and email is excluded from model/audit persistence.
- **Edge:** Cloudflare DNS/CDN/WAF/Turnstile in front of Google HTTPS Load Balancing, a Cloud Armor Cloudflare-only origin ACL, and load-balancer-only Cloud Run ingress.
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
- `infra/` - OpenTofu for Cloud SQL, KMS, secrets, least-privilege identities, GitHub OIDC, load balancing, Cloud Armor, and retention scheduling.

## Setup

```bash
bun install --frozen-lockfile
cp .env.example .env
```

For a full local console, supply WorkOS test credentials/organization, local PostgreSQL, Google ADC with KMS access, a Cloudflare AI Gateway, and a 32+ character session secret and audit pepper. The checked-in Turnstile values are Cloudflare's official development-only keys; production rejects local hostnames and uses a separately created widget.

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

Admin reads such as `GET /api/inquiries`, `GET /api/telemetry/summary`, and conversation-audit access require a valid invited-organization session and `ADMIN_EMAILS` allowlist membership. Production sets `ADMIN_REQUIRE_MFA=true`. Non-SSO administrators need an enrolled WorkOS TOTP factor and a verified Required-policy attestation; SSO administrators need the separate attestation that their identity provider enforces MFA because WorkOS's own MFA policy excludes SSO. Both paths require the signed WorkOS `auth_time` to be under ten minutes old, and impersonated sessions are denied. Audit inventory and reads are POST-only, organization-scoped, require a reason of at least eight characters, and retain requested/succeeded/failed access events without decrypted content. See `docs/mfa-workos-runbook.md`.

Write endpoints are protected on independent axes. In-memory fixed-window limits cap request count, `src/lib/server/body-limit.ts` caps body size, and the public inquiry/access-request funnel additionally requires a one-time Turnstile token validated server-side for the exact `inquiry` action and allowlisted hostname. Next route handlers have no default body cap, so give every new body-consuming route an explicit cap sized to its payload.

## Deployment

The Dockerfile targets Google Cloud Run, runs as a non-root user, and executes `next start` on the injected `PORT`. [`infra/`](infra/) provisions the durable/security foundation with OpenTofu. The deploy workflow authenticates through GitHub OIDC—there is no long-lived GCP key—builds an immutable SHA-tagged Artifact Registry image, mounts the Cloud SQL connector, injects Secret Manager values, restricts ingress to the external load balancer, and disables the default `run.app` URL.

`APP_URL=https://quesar.cloud` is required as the OAuth redirect base. Leave `FRONTEND_URL` unset unless a proxy preserves the state-cookie topology. `.github/workflows/ci.yml` runs lint/test/build on every push and PR to `main`; deployment then checks out the exact successful push SHA and retains the event/repository trust checks that keep fork PRs outside production context. See [`docs/deploy-cloud-run.md`](docs/deploy-cloud-run.md) for bootstrap, secrets, provider configuration, DNS cutover, and acceptance gates.
