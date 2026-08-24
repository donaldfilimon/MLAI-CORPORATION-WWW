# Repository Guide

This application lives at `apps/web/` in the MLAI integration repository. Run app-local commands from this directory or use `bun run check:web` at the repository root; web-specific OpenTofu also lives here under `infra/`.\n\n## Runtime And Boundaries

- The active application is Bun 1.4 + Next.js 15 App Router + React 19 + TailwindCSS v4. Next serves pages and `app/api/*` route handlers in one process. Vite, Hono, Rust/Axum, `server.ts`, and `src/pages/` are retired; do not restore them.
- Route `page.tsx` files are thin server components. Standard pages expose `src/views/*` through a per-route `client.tsx` (`"use client"` re-export). Browser-only views use `next/dynamic(..., { ssr: false })`; copy that form from `/showcase/*` or `/tf-pose-demo` only when the view needs browser APIs.
- Ported views still import `react-router-dom`, but TypeScript, webpack, and Turbopack alias it to `src/lib/router-compat.tsx`. The package is intentionally absent. Do not add it or introduce `BrowserRouter`/`Routes`; route structure belongs in `app/`.
- Shared server logic is in `src/lib/server/`. Content-backed marketing, blog, research, team, and product copy lives in `src/data/categories/*`, aggregated by `src/data/index.ts`; edit those surfaces there rather than baking copy into views.

## Commands And Gates

- `bun install --frozen-lockfile` matches CI and uses the checked-in `bun.lock`.
- `bun run dev` starts the complete app on port 3000. `bun run start` honors an injected `PORT`.
- `bun run lint` is TypeScript checking (`tsc --noEmit`), not ESLint or formatting.
- `bun run test` runs Vitest in a Node-only environment. There is no jsdom/component-test setup. Focus with `bunx vitest run src/__tests__/file.test.ts` or `bunx vitest run -t "name"`; do not use `bun test`, which invokes Bun's runner.
- `bun run build` first regenerates `public/sitemap.xml` and `public/llms.txt`, then runs `next build`. Do not hand-edit either generated file.
- CI runs `bun run lint` -> `bun run test` -> `bun run build`. Run that order for production-impacting work; route, metadata, content, and sitemap changes require the build.
- `bun run crawl` needs `bun run dev` in another shell or `BASE_URL=<origin>`. It is the real-browser check for dead compat-shim links, asset failures, soft 404s, and console errors. Playwright is deliberately not a root dependency; the script also resolves it from `.ds-sync/node_modules` and prints setup instructions if absent.
- `bun run design-sync:css` compiles `src/index.css` into the gitignored `.design-sync/lab-compiled.css` that `.design-sync/config.json` hands the claude.ai/design converter; rerun it every sync, never commit the output. `design-sync.test.ts` pins that config against the real files.
- `bun run smoke` also needs a running app. Its default API matrix includes body-limit checks; `SMOKE_WRITE=1` adds an inquiry DB write, `SMOKE_RATELIMIT=1` adds the 61-request CSP limiter burst, and `SESSION_COOKIE=...` exercises authenticated admin behavior. Neither crawl nor smoke runs in CI.
- `bun run og` regenerates the static raster brand assets in `public/`; it needs python3 with `pillow fonttools brotli` and is distinct from the per-slug Satori OG images Next builds at build time.

## Routes, Metadata, And Generated Surfaces

- Adding a route normally means: view in `src/views/`, `app/<route>/client.tsx`, thin `page.tsx`, metadata in `src/lib/route-meta.ts`, and an explicit `scripts/generate-sitemap.ts` entry only when indexable. Dynamic blog/research/team/product routes derive metadata and sitemap entries from content.
- The six `noindex` routes are `/login`, `/signup`, `/console`, `/profile`, `/financial-model`, and `/tf-pose-demo`; they are intentionally absent from the sitemap. Do not add them to `robots.txt` `Disallow`: crawlers must fetch them to see `noindex`.
- Keep site-level Open Graph, Twitter, and feed-alternate defaults in `toNextMetadata()`. Next replaces those metadata objects instead of deep-merging layout defaults. The layout copies still cover `not-found`.
- Blog, research, team, and product detail routes own `opengraph-image.tsx`. For those paths, `toNextMetadata()` must leave `images` absent, not `undefined`, or Next's file-convention image is overridden. `route-meta.test.ts` pins this behavior.
- `site/` is a second, static GitHub Pages surface, not the Next app. It cannot reference `public/` or `/_next/`. Brand assets duplicated there must stay byte-aligned with `public/`; `landing-page.test.ts` is the publish guard. After `bun run og`, refresh the matching `site/` assets too.

## Components And Styling

- Build primitives from `src/components/ui/` and section-level page blocks from `src/components/site/`. `site/` blocks take content as props, keep router dependencies out, and require `measured | target | reported` provenance on figures.
- `FAQ.tsx`/`Stats.tsx` intentionally differ from `site/FAQList`/`site/StatBlock`. Do not collapse them. `Stats.tsx` now presents operating-model facts only; performance figures require a reproducible repository harness and published methodology.
- `src/components/ds.ts` is bundled for claude.ai/design. Anything reachable from it must be transitively free of `react-router-dom` and `next/*`; those imports crash the standalone browser bundle. `LogoMark` is exported, while router-dependent `Logo` is intentionally excluded.
- Tailwind v4 has no `tailwind.config.js`; canonical tokens and custom utilities live in `src/index.css`. Preserve the current Lab identity: cyan/sky brand chrome, near-black ink, Spectral display type, and violet/emerald/amber persona accents. Do not revive the retired indigo/fuchsia Signal palette.
- `src/design/` is real `/showcase/design` source. It is distinct from partially tracked `.design-sync/`, ignored `ds-bundle/` output, and ignored `.ds-sync/` staging. `src/design/mlai-ds-tokens.css` stays scoped under `.mlai-ds` through `CinematicShell`; do not promote it to global `:root`.
- Keep route-heavy code isolated: TensorFlow belongs only to `/tf-pose-demo`, and `src/film/neural-voice.ts` must retain its lazy CDN import so Kokoro/ONNX does not enter server or initial marketing bundles.

## Content And Claims

- Blog and research bodies are structured data, not JSX. Slugs, bodies, metadata, feeds, JSON-LD, OG images, sitemap entries, and `llms.txt` all derive from the content layer; `content.test.ts` enforces slug/body contracts.
- Public copy must not invent or overstate benchmark, security, compliance, distributed-sharding, scaling, partnership, or certification claims. Unverified metrics are targets. Preserve provenance from `docs/master-reference.md`: measured, target, and reported are not interchangeable.
- For WDBX architecture the **sibling Rust substrate `~/dev/active/wdbx/crates/` outranks everything here**; a tagged table outranks an untagged bullet always. The mirrored docs in `public/docs/wdbx/` are a frozen Zig-era snapshot with no live upstream, so their silence is missing documentation, not a missing feature — do not cite it as proof a claim is invented. That inference was drawn once, on 2026-08-24, and the substrate refuted it: `crates/abi-wdbx/src/hnsw.rs` is a real layered HNSW graph and `mvcc.rs` is real. The real defaults are `M = 16`, `EF_CONSTRUCTION = 40`, and `EF_SEARCH = 32`; stale public `200` values were corrected on 2026-08-24 and `claims.test.ts` prevents their return. `cluster_rpc.rs` states it is "not ... sharding", so distributed-sharding copy stays forbidden. Apple wording is limited to "built on Apple's public frameworks", never partnership or endorsement.
- `/benchmarks` may not contain competitor comparisons or untagged figures. New numbers require a reproducible repository harness and published methodology; otherwise omit them.
- Telemetry persists only allowlisted event + pathname + timestamp; both fields pass through the allowlists in `src/lib/server/telemetry-path.ts`. Never add free-text or identifying fields.
- Multi-team bylines join on a middle dot; split them with `bylineNames` from `src/lib/byline.ts`, never a local comma-split (that bug shipped twice).

## Server And Deployment Traps

- Every handler that consumes a request body must use `src/lib/server/body-limit.ts`; Next route handlers have no default body cap. Rate limits cap request count, not bytes. `readJsonLimited<T>` returns `T | Response`, guarantees only a non-null plain-object shape, and still requires route-level field validation. Current caps are 4 KB telemetry/checkout, 16 KB profile, 32 KB inquiries, 64 KB CSP reports, and 128 KB LLM chat.
- Keep `/api/auth/login` behind `src/lib/server/authkit-entry.ts`; `/api/auth/signup` intentionally redirects to the request-access funnel and must not restore open self-provisioning.
- The CSP is a specific-origin allowlist in `next.config.ts`; add origins to the narrow directive, never a bare `https:` wildcard. Keep both `report-to` and `report-uri`. In `app/api/csp-report/route.ts`, the rate-limit check must remain the first statement, and reports stay in stdout rather than privacy-limited telemetry storage.
- OAuth state is nonce-bound to the `mlai_auth_state` cookie. `APP_URL` is required in deployments. Normally `FRONTEND_URL`, when set, must use the same host so the state cookie returns; a mismatch is valid only behind a proxy that preserves that cookie topology. Leave `FRONTEND_URL` unset rather than empty because an empty string defeats the fallback.
- Production sessions require `SESSION_SECRET` with at least 32 characters; missing or short values fail closed.
- Generation is fixed to stable `google/gemini-3.7-flash` through Cloudflare AI Gateway's authenticated REST `/ai/v1/chat/completions` endpoint. The app has no direct Gemini/Anthropic production bypass. Keep payload collection and gateway caching disabled on every request, and never serialize the user's email into provider messages.
- Production admin reads fail closed without `ADMIN_EMAILS`. With `ADMIN_REQUIRE_MFA=true`, non-SSO sessions additionally require a WorkOS TOTP factor, the verified Required-policy attestation, and a fresh signed `auth_time`; SSO sessions require the separate `WORKOS_SSO_MFA_POLICY_VERIFIED=true` IdP-policy attestation because WorkOS MFA does not apply to SSO. Impersonated sessions are denied. All admin access also requires active organization membership.
- Cloud SQL Postgres is the only persistent runtime store. Production connects through the Cloud SQL Unix socket; `DATABASE_URL` remains for local/external Postgres only. Schema migration uses a transaction-scoped advisory lock, and the app fails closed rather than opening a local file.
- Conversation payloads require explicit versioned consent, per-record AES-256-GCM keys wrapped by Cloud KMS, a 365-day expiry, user read/export/delete controls, and MFA/reason-gated admin reads whose outcomes are logged. The daily expiry endpoint accepts only a Google OIDC token for the exact scheduler service account and audience.
- Public inquiry/access requests require Cloudflare Turnstile. The server must call canonical Siteverify, fail closed, and validate both action and deployment-specific hostname; production hostnames may not include localhost.
- Automatic Cloud Run deployment is gated on successful push CI and checks out the validated SHA; `workflow_dispatch` is the deliberate manual exception. Preserve the workflow's `workflow_run.event == 'push'` and `head_repository.full_name == github.repository` trust checks so fork PRs never receive production deployment context.
- The deploy uses GitHub OIDC, an immutable Artifact Registry image, a required least-privilege `RUNTIME_SA`, load-balancer-only ingress, a disabled `run.app` URL, and a Cloud SQL mount. Do not restore a long-lived `GCP_SA_KEY` or make the origin directly reachable.
- OpenTofu in `infra/` owns Cloud SQL, KMS, Secret Manager containers, identities/OIDC, the external HTTPS load balancer, Cloud Armor's Cloudflare-only source ACL, and the retention scheduler. Refresh Cloudflare's published proxy ranges add-first/remove-second before apply.

## Instruction Maintenance

- Durable command, architecture, security, or claims changes must remain aligned across `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and the relevant README guidance; adapt each file rather than making them byte-identical.
