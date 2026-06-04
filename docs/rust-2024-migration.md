# Rust 2024 Migration Plan

This repository now contains a Rust 2024 Axum backend target in `rust/server`. The existing React/Vite frontend remains the active UI while the backend migration is hardened.

## Migration Goals

1. Replace the Bun/Hono server with a Rust 2024 Axum server without changing frontend API contracts.
2. Preserve current WorkOS AuthKit, protected LLM/billing endpoints, inquiry storage, and SPA static serving behavior.
3. Keep `/api/*` response shapes compatible with `src/lib/api.ts` until the frontend is migrated.
4. Migrate the frontend only after choosing a Rust UI/runtime strategy.

## Current Rust 2024 Scope

Implemented in `rust/server`:

- Axum + Tokio application bootstrap
- SQLx SQLite inquiry persistence
- private encrypted cookie session handling via `tower-cookies`
- WorkOS AuthKit authorization/callback adapter
- protected LLM status/chat endpoints with Gemini support and local fallback
- protected billing/profile endpoints
- static `dist/` SPA serving
- Rust Docker target via `Dockerfile.rust`

## Frontend Migration Options

A true “entire codebase in Rust” rewrite needs an explicit frontend framework choice:

| Option | Fit | Tradeoffs |
| --- | --- | --- |
| Leptos | Full-stack Rust, SSR/hydration capable | Most natural path if replacing React with Rust components |
| Dioxus | Rust UI with web/desktop ambitions | Good component ergonomics, ecosystem differs from current routing/data model |
| Yew | Mature Rust WASM SPA | Closer SPA model, but less SSR/full-stack integration |
| Axum + static templates | Fast static marketing site | Less suitable for private console interactivity |

Recommended path: keep React while promoting the Rust backend, then evaluate Leptos for a page-by-page frontend rewrite if the product truly requires Rust UI.

## Validation Checklist

```bash
bun run build
bun run check:rust
bun run server:rust
```

Then manually verify:

- `GET /api/auth/features`
- `POST /api/inquiries`
- `GET /api/auth/login` redirects when WorkOS is configured
- WorkOS callback sets `mlai_session`
- authenticated `GET /api/auth/me`
- authenticated `/api/llm/*`, `/api/billing/*`, `PATCH /api/profile`
- SPA routes render from `dist/index.html`

## Promotion Criteria

The Rust server should replace `server.ts` only after:

- `cargo check -p mlai-www-server` passes in CI
- WorkOS OAuth exchange is tested against a real AuthKit environment
- cookie settings are verified behind Cloud Run / proxy headers
- inquiry persistence is validated against the production storage target
- parity checks confirm no frontend API contract regressions
