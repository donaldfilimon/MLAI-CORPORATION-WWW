# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` is canonical for the required invariants (workspace authorization, no silent hosted
fallback, trace redaction, WDBX exclusivity, deletion cascade, staff scope, extraction vs
interpretation) and for style. Read it first. This file adds commands and the architecture that
only becomes visible after reading several files at once. `README.md` documents the operator
setup and the full command table; do not duplicate it here.

## Runtime split

Bun is the package manager and script runner only. Every script runs on Node through
`node --import tsx` because `better-sqlite3` and `@grpc/grpc-js` are native Node addons. Never
execute a script with the Bun runtime (`bun scripts/dev.ts`); use `bun run dev`.

Ports are fixed by convention: 3100 development, 3101 Playwright, 3102 the optional
`bun run model` MLX server. `scripts/env.ts` loads `.env.local`/`.env` through `@next/env` at the
top of every entry point.

Several server modules resolve paths relative to the process cwd (`resolve("drizzle")`,
`resolve("worker/.venv/bin/python")`, `resolve("src/lib/server/gateway.proto")`). Everything must
run from the repository root.

## Commands

`bun run setup` is a prerequisite for `check`, not an optional convenience: it creates
`worker/.venv`, downloads and SHA-512 verifies the Tika jar into `.tools/`, downloads the pinned
embedding model, and writes `.data/capabilities.json`.

- `bun run check` = shared UI build/declarations + application `typecheck` + `vitest run` + `uv run --project worker pytest worker/tests` +
  `next build`. There is no linter; use `bun run format:check` for read-only formatting validation.
- One unit test: `bunx vitest run tests/api.test.ts -t "partial name"`.
- One parser test: `uv run --project worker pytest worker/tests/test_extract.py -k archive`.
- One browser test: `bunx playwright test tests/e2e/portal.spec.ts`. Install the browser once with
  `bunx playwright install chromium`. Playwright starts its own `bun run dev` against `.data-e2e`,
  `.next-e2e` and port 3101, and reuses an already running server outside CI.
  `tests/e2e/live-chat.spec.ts` needs `MLAI_E2E_MODEL_URL` and `MLAI_E2E_MODEL_ID`.

`AGENTS.md` requires keeping `docs/IMPLEMENTATION.md` current with evidence. Separate the historical baseline from combined-release receipts; do not tick a gate without results tied to the source under review.

## Request path

There is exactly one API route file, `src/app/api/v1/[...path]/route.ts`, which forwards every
method to `dispatch()` in `src/lib/server/api.ts`. Adding an endpoint means editing a route module,
never adding a Next route file.

`dispatch` derives the required scope from method and path (`GET` is `read`, `chat`, `documents`,
`playground`/`connections` are `console`, everything else is `write`), then calls `context()` in
`http.ts`, which resolves either a Better Auth session or a `Bearer` API key whose stored scopes
must contain that scope. It then walks `workspaceRoutes`, `documentRoutes`, `portalRoutes`,
`consoleRoutes` in order; each returns `Response | undefined`. `chat` and the WDBX
`connections/:id/events` stream are handled before that loop because they return SSE.

Authorization helpers live in `http.ts` and are the only correct way to check access:
`resource(table, id, ctx)` scopes a row to the workspace, `owner(ctx)` additionally rejects API
keys, and membership plus rate limiting already happened in `context()`. Workspace identity comes
from `?workspace=`, then `x-workspace-id`, then the user's first membership. Browser mutations
require `Origin` equal to `APP_URL`; requests bearing a `Bearer` token are exempt.

Errors are thrown with `fail(status, code, message)` and rendered by `handle()` with a stable code
and an `X-Request-ID`. Unexpected exceptions are logged by name only and returned as
`internal_error`.

## Persistence

`src/lib/server/schema.ts` models only the four Better Auth tables. Every application table is
defined in hand-written SQL under `drizzle/000N_*.sql` and reached through the raw `one`, `all`,
`run` helpers in `db.ts`, not through Drizzle query builders. To add a table, write a new numbered
SQL file (statements separated by `--> statement-breakpoint`) and append an entry to
`drizzle/meta/_journal.json`. Editing `schema.ts` alone does nothing.

Importing `db.ts` opens the SQLite file, sets WAL and foreign keys, and runs pending migrations as
a side effect; importing `config.ts` creates `.data`, the upload directories, and the auth secret.
That is why `tests/api.test.ts` sets `MLAI_DATA_DIR` before a dynamic `await import` of the server
modules, and why new tests must do the same.

Full-text search rides an FTS5 table (`chunks_fts`) kept in sync by insert and delete triggers, so
writing to `chunks` is enough.

## Worker and document pipeline

`scripts/dev.ts` spawns Next plus `scripts/worker.ts` and forwards signals to both. The worker
polls the `jobs` table every second, takes a 30 second lease, refreshes it on a 5 second
heartbeat, and requeues expired leases on the next acquire, so a crashed worker recovers without
manual intervention. Job kinds are `extract` (default) and `interpret`, the latter carrying a JSON
`payload`.

Extraction spawns `worker/.venv/bin/python worker/extract.py`, wrapped on macOS in
`sandbox-exec -p "(version 1)(allow default)(deny network*)"`. `extract.py` writes exactly one
JSON object to stdout and must stay that way; the worker parses only the last stdout line for an
error message. Embeddings spawn `worker/embed.py` with `HF_HUB_OFFLINE=1`.

Advertised formats are not hardcoded to the parser's ambitions. `bun run verify:formats` writes
`.data/capabilities.json` keyed to the installed docling version, and uploads of untested
extensions are refused. After changing format support, rerun that command.

The embedding space string is duplicated in `worker/embed.py` (`SPACE`) and
`src/lib/server/embeddings.ts` (`embeddingSpace`); a mismatch silently disables semantic search,
because `embed()` rejects any result whose space differs. Changing the model or revision
invalidates every stored vector, since `semanticSearch` filters on that exact space.

`retrieve()` in `search.ts` merges semantic and keyword hits and degrades to keyword-only with a
stated reason rather than failing, which is the behavior the UI reports.

## Model selection

`models.ts` holds the provider guarantees: no fallback to another connection on failure, hosted
connections blocked unless the workspace row has `hosted_consent`, local connections forced to a
loopback URL, hosted forced to HTTPS, credentials never accepted in the URL, `redirect: "error"`
on every fetch, and model identifiers marked as cloud rejected in local mode. Connections
themselves come from the operator-owned `.data/connections.json` (`config.ts`), never from
request input; the API exposes name, kind, and model only.

Chat streams SSE events `start`, `delta`, `provider`, `done`, `error`. `checkedCitations` rewrites
any `[n]` outside the supplied source range to `[unsupported citation]`. A partial unique index
(`one_stream_per_conversation`) enforces one active stream per conversation, checked again inside
the insert transaction. Cancelling preserves the partial message with a `cancelled` status.

## Console services

WDBX runs over gRPC with `src/lib/server/gateway.proto` loaded at runtime. The `bindings` table
maps a normalized `wdbx:host:port` key to exactly one workspace, and an owner must bind before any
playground call; the protocol has no tenant field, so this binding is the isolation. Only the
operations in the `schemas` map in `console.ts` are reachable, and `TextSearch` is a local
convenience that embeds text and calls `Search`. ABI is restricted to `dashboard --once --json`
and `backends` with a 10 second timeout and no shell.

## Front end

`packages/ui` is a private React workspace package with compiled ESM, declarations, CSS and font dependencies. Application wrappers inject Next navigation and API submission handlers. Both `dev` and `typecheck` build the package first; production `build` also builds it. Never rely on committed or stale `dist` output. TypeScript checks package sources separately from application sources. The project development agent is `.claude/agents/abbey.md`; it does not configure the in-app assistant.

Public pages are data: `src/content/pages.ts` holds every article, rendered by
`src/app/(public)/[...slug]/page.tsx`. Adding a public page means adding a key there, not a route.
The whole authenticated product is one client shell, `src/components/workspace-app.tsx`, mounted
by `/app/[[...view]]` and switching on the view segment. Test layouts at 390, 768 and 1440 pixels.

`next.config.ts` keeps `better-sqlite3` and the gRPC packages in `serverExternalPackages`; server
modules that build paths dynamically carry `/* turbopackIgnore: true */`. Both are load-bearing.
