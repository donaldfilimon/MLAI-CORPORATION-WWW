# Quasar v1 — AI Website Builder (design spec)

**Date:** 2026-08-19 · **Status:** approved design, pre-implementation
**Owner:** Donald Filimon

## 1. What Quasar is, and what v1 is

Quasar is an all-in-one cloud hosting and AI-accelerated website-building
platform. It is too large for one spec, so it is decomposed into staged
sub-projects:

1. **AI website builder pipeline** (this spec) — prompt → generated site →
   local preview.
2. Deploy adapters (Cloudflare/Vercel/own-infra) — later.
3. Hosting control plane (own-infra serving, TLS, subdomains) — later.
4. Desktop shell, auth/multi-user, templates gallery — later.

**v1 scope:** a local Bun service on the user's Mac that generates and
incrementally edits **Next.js 15 App Router** projects with Claude, previews
them via `next dev`, and an **Expo app** (web/iOS/Android) that drives it.
"Deploy" does not exist in v1; preview is local only.

## 2. Repo layout

Monorepo at `/Volumes/Extreme SSD/quasar`, Bun workspaces:

```
packages/shared     API contract: TS types + zod schemas (Site, GenerationEvent, PreviewStatus)
packages/service    local Bun service (Bun.serve, default port 4700)
apps/quasar         Expo SDK 53 / React 19 / Expo Router app (web + iOS + Android)
templates/next-site checked-in minimal Next.js 15 App Router + Tailwind template
docs/superpowers/specs  this spec
```

Conventions carried over from mlai-mobile: Bun only (no npm/yarn/pnpm),
TypeScript strict, dark ink UI with a token file and typed text/surface
primitives. Quasar gets its **own accent** — it is not MLAI-branded.

## 3. Data model (no database)

- Each site is a plain directory: `~/.quasar/sites/<slug>/` — a real,
  editor-openable Next.js project scaffolded from `templates/next-site`.
- `~/.quasar/registry.json` — array of
  `{ id, name, slug, promptHistory: [{prompt, at}], createdAt, previewPort, status }`.
  `status ∈ idle | generating | error`. Registry writes are atomic
  (write temp file + rename).
- Scaffold = copy template (excluding `node_modules`) + `bun install` in the
  site dir once at creation.

## 4. Service API (localhost JSON + SSE)

| Method | Path | Behavior |
|---|---|---|
| GET | `/api/sites` | list registry entries |
| POST | `/api/sites` | `{name, prompt}` → scaffold + start generation job → 202 with site |
| GET | `/api/sites/:id` | site detail incl. job status |
| POST | `/api/sites/:id/edit` | `{prompt}` → start incremental edit job (409 if a job is running) |
| GET | `/api/sites/:id/events` | SSE stream of generation events |
| POST | `/api/sites/:id/preview/start` | spawn `next dev`; returns `{url, port}` |
| POST | `/api/sites/:id/preview/stop` | kill the preview process |
| GET | `/api/sites/:id/preview` | preview status (`running/stopped/crashed` + log tail) |
| DELETE | `/api/sites/:id` | stop preview, remove dir + registry entry |

- **One generation job per site at a time** (per-site mutex).
- SSE event types: `text` (model narration), `tool` (`{name, path}` for each
  file op), `done`, `error {message}`. Events also buffered per job so a
  late-attaching client can catch up.
- CORS: allow the Expo web origin; bind to `0.0.0.0` so phones on the LAN can
  reach it (the service holds no secrets worth protecting beyond the machine
  boundary; still, no key material is ever served).

## 5. Generation engine

- **SDK:** `@anthropic-ai/sdk` (TypeScript). Credentials resolve the SDK's
  normal way (`ANTHROPIC_API_KEY` env or `ant auth login` profile); the
  service never stores or proxies a key of its own.
- **Model:** `claude-opus-5`, `thinking: {type: "adaptive"}`, streaming,
  `max_tokens` 64000.
- **Loop:** the SDK beta Tool Runner (`client.beta.messages.toolRunner`) with
  exactly three `betaZodTool` tools:
  - `list_files()` → relative paths (excluding `node_modules`, `.next`, `.git`)
  - `read_file({path})` → file text (size-capped)
  - `write_file({path, content})` → writes + emits a `tool` SSE event
- **Path guard (security-critical):** every tool path is resolved against the
  site dir; the resolved path must stay inside it. Reject `..`, absolute
  paths, symlink escapes (`fs.realpath` on the parent), writes into `.git`/
  `node_modules`/`.next`, and files > 512 KB. This guard is a pure function
  with its own unit tests.
- **System prompt:** describes the template's file structure, Next 15 App
  Router + Tailwind conventions, and design-quality guidance. Edits run the
  same loop over the existing files with the edit prompt — incremental by
  construction.
- **Errors:** typed SDK error chain (`RateLimitError` → `AuthenticationError`
  → `APIError` → connection) mapped to a job `error` event with a
  user-readable message.

## 6. Preview manager

- Ports allocated from 4710 upward (first free; recorded in registry).
- `Bun.spawn(["bun", "next", "dev", "--port", p], {cwd: siteDir})`; stdout/
  stderr ring-buffered (log tail for crash reports).
- Health check: poll `http://localhost:p/` until 200 (bounded retries) before
  reporting `running`.
- Process exit while `running` → status `crashed` + log tail.
- All previews stopped on service shutdown (SIGINT/SIGTERM handler).

## 7. App (apps/quasar)

Screens (Expo Router):
- **Sites** — list with status chips; pull-to-refresh.
- **New site** — name + prompt → POST → navigate to detail.
- **Site detail** — live generation feed (SSE; on native, fetch-stream
  fallback if EventSource is unavailable), file-write ticker, preview
  start/stop + URL, edit-prompt box (disabled while a job runs).
- **Settings** — service base URL (default `http://localhost:4700`; user sets
  the Mac's LAN IP when on a phone).

Preview display: web embeds an iframe; native opens the URL via `Linking`
(WebView is a later nicety).

## 8. Testing & verification gates

- Unit tests: path guard (the security boundary — exhaustive cases), registry
  read/write/atomicity, port allocator, SSE event buffer. Engine tested with a
  mocked Anthropic client (no network in tests).
- Gates that must pass: `bun run typecheck` (workspace-wide),
  `bun run test`, and `bunx expo export --platform web` for `apps/quasar`.
- Manual acceptance: create a site from a prompt, watch the stream, open the
  preview, run one edit prompt, see the change on reload.

## 9. Explicitly out of scope for v1

Deploy targets and adapters, own-infra hosting, auth/multi-user, billing,
desktop shell, templates gallery, site export, CloudKit/iCloud anything.
