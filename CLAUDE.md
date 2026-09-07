# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` is canonical for the required invariants (workspace authorization, no silent hosted
fallback, trace redaction, WDBX exclusivity, deletion cascade, staff scope, extraction vs
interpretation) and for style. Read it first. This file adds commands and the architecture that
only becomes visible after reading several files at once. `README.md` documents the operator
setup and the full command table; do not duplicate it here.

## Runtime split

Bun is the package manager and script runner only. Runtime TypeScript scripts run on Node through
`node --import tsx`; `better-sqlite3` is a native Node addon and gRPC uses Node packages. Never
execute a script with the Bun runtime (`bun scripts/dev.ts`); use `bun run dev`.

Ports are fixed by convention: 3100 development, 3101 Playwright, 3102 the optional
`bun run model` MLX server, 3104/3105 the optional `bun run gateway` WDBX playground.
`scripts/env.ts` loads `.env.local`/`.env` through `@next/env` at the top of every entry point.

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
- Agent runs have their own suites: `tests/agent.test.ts` covers dispatch authority, proposal and
  confirmation, stale revisions, budgets, and lease fencing; `tests/worker-agent.test.ts` covers
  publication guards and restoring an interrupted run. The live gate is `bun run verify:agent`,
  which requires `MLAI_MODEL_URL` and `MLAI_MODEL_ID` and refuses a non-loopback host; it backs up
  mid-run, restores into an isolated directory, and finishes the run there through
  `scripts/verify-agent-restored.ts`.

Three gate behaviors have already cost sessions time; `docs/IMPLEMENTATION.md` records each.

- Run `bun run db:migrate` once, serially, against the isolated `MLAI_DATA_DIR` you intend to
  check with, before `bun run check`. The build stage otherwise races its own fresh-database
  migration and dies on `table user already exists` after TypeScript has already passed.
- `bun run format:check` fails repo-wide on eleven pre-existing files carried in unformatted since
  `e0f9907` (`agent-contracts.ts`, `agent-jobs.ts`, `documents.ts`, `embeddings.ts`, `models.ts`,
  `worker.ts`, `restore.ts`, `verify-agent-restored.ts`, `agent-view.tsx`, `models.test.ts`,
  `worker-agent.test.ts`). That red is not yours. A repo-wide `bunx prettier --write .` belongs in
  its own commit, because reformatting `agent-contracts.ts` alone expands 41 lines to 216.
- `next build` sometimes rewrites `tsconfig.json` with generated dist-dir includes. Compare it
  before and after and revert before committing; it does not happen on every run.

Read the exit code from the command itself, never through a pipe — `bun run check | tail` reports
tail's status. `docs/IMPLEMENTATION.md` records every gate result here as having been read directly
for that reason.

`AGENTS.md` requires keeping `docs/IMPLEMENTATION.md` current with evidence. Separate the historical baseline from combined-release receipts; do not tick a gate without results tied to the source under review.

## Request path

The v1 API entry point is `src/app/api/v1/[...path]/route.ts`, which forwards every
method to `dispatch()` in `src/lib/server/api.ts`. Adding an endpoint means editing a route module,
never adding a Next route file.

`dispatch` derives required scope from method and path, then calls `context()` in
`http.ts` to resolve a Better Auth session or scoped Bearer API key. Keep the scope mapping,
session-only exceptions, and ordered route-module list in `api.ts` authoritative rather than
duplicating them in new Next route files. `chat` and the WDBX `connections/:id/events` stream
are handled before that loop because they return SSE.

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
leases document jobs and agent runs; `scripts/worker.ts` and `src/lib/server/agent-runtime.ts`
own scheduling and lease rules. Document jobs include extraction and interpretation. Preserve
attempt/lease ownership checks around publication and cleanup so stale workers cannot overwrite
or delete a newer attempt's output. Expired leases are recovered during acquisition.

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

## Agent runs

Six modules under `src/lib/server` own autonomous runs and split by responsibility:
`agent-routes.ts` (HTTP), `agent-runtime.ts` (worker loop), `agent-store.ts` (rows, leases,
authorization, invalidation), `agent-tools.ts` (read tools), `agent-actions.ts` (write proposals),
and `agent-jobs.ts` (interpretation jobs a run queued). Limits, tool schemas, and the run and action
status enums are shared with the browser in `src/lib/agent-contracts.ts` (`agentLimits`,
`agentDecisionSchema`); change them there rather than in a server module.

Agent endpoints are session-only. `dispatch` rejects any `agent` request carrying an
`Authorization` header with 403 `session_required` before `context()` runs, and `agentRoutes`
repeats the check for API keys. Unlike chat and WDBX events, the agent SSE stream is served from
inside `agentRoutes` (`agentEvents`), not from a pre-loop branch. A partial unique index,
`agent_active_conversation`, allows one non-terminal run per conversation, mirroring
`one_stream_per_conversation`.

Read tools execute inline and record an `agent_steps` row plus the chunks they touched in
`agent_sources`. Write tools never apply directly: `proposeAction` records an `agent_actions` row
capturing every affected resource with the `revision` it saw, the run moves to `awaiting_approval`,
and only the requester confirming through `agent/actions/:id/confirm` lets the worker call
`applyAction`. `applyAction` re-runs `validateAction` under the lease inside an immediate
transaction, and a changed `revision` fails 409 `source_changed` instead of writing. That is why
migration 0003 adds `revision` columns and update triggers to `projects` and `documents`.

Deleting or reprocessing a document calls `invalidateAgentSources`, from `documents.ts` and from
`scripts/worker.ts`. It fails any non-terminal run that touched the document, marks its pending and
approved actions `stale`, drops the pinned sources, and flags historic citations `removed` instead
of deleting them, which is the deletion-cascade invariant applied to runs.

The worker acquires a run with a `lease_token` and heartbeats it; every publication path checks
`ownsAgentLease` or `requireAgentLease`, so a resumed or duplicate worker cannot overwrite a newer
attempt. The heartbeat re-validates limits, sources, and model selection, so a run stops when the
workspace changes provider mid-flight. Interpretation a run queues is an ordinary `jobs` row
bridged by `agent_jobs`: migration 0004's trigger bumps the run revision when that job's status
changes, and 0005 cancels its queued or running jobs when the run is deleted.

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

## Public claims are gated by tests, not by review

The public site describes four sibling repositories (`abi`, `abbey`, `abbey-bot`/`AbbeyBot`,
`wdbx`) that this repository cannot import, so nothing here can prove a claim true. Two mechanisms
substitute for that, and both fail the build rather than warn.

`src/content/provenance.ts` is the gate in front of any published number. Every figure carries
exactly one tag — `measured`, `target`, or `reported` — plus a `source`, and
`BANNED_HANDOFF_FIGURES` names the design-handoff mock numbers (295×, 13× neural, 0.8 ms) that must
never come back. An empty `figures` array is intentional until a reproducible harness exists; a
number with no harness belongs on the `target` tag with no value, not on `measured`. Provenance
tags describe how a figure was obtained and are distinct from the claim-ledger words on
`/repositories` (`current` / `partial` / `proposed` / `not-claimed`), which describe capability
honesty. `ProvTag` and `ProvLegend` in `src/components/prov-tag.tsx` render both.

`tests/claims.test.ts` enforces it by walking every `.ts`/`.tsx` file under `src/content`,
`src/components` and `src/app` and asserting that specific claims found false against sibling
source on 2026-09-07 cannot be restored by pasting an older handoff back in — stale HNSW `200`
defaults, `discord.js` as Abbey Bot's runtime, neural backtracking, empathy or conciseness loss
terms. It also renders the WDBX, ABI and architecture pages to static markup and requires every
figure to actually reach a page next to its own provenance chip, so no figure becomes dead data.
The file header lists the source files and constants each claim was checked against; extend that
header when adding a claim rather than asserting a number from memory.

`tests/research.test.ts` guards the research collection the same way. The 21 publications, six
tracks and three retained application notes were imported from the sibling `mlai` source and the
linked Sites export, and `docs/research-merge/source-manifest.json` describes **that original
exported artifact**, not this app's generated HTML. The test asserts the local corpus still matches
it by deep equality, that all four publication PDFs match their recorded SHA-256 editions, and that
every track, legacy note, guide link, route and sitemap entry still resolves. So a failure means
the corpus has diverged from the source it was imported from — editing the manifest to match new
copy defeats the check. `docs/research-merge/report-source.md` records the import decision and the
26 pinned source files behind 66 article-source references; `source-verification.json` holds their
hashes. Research copy is imported content, not house copy.

## mlai-web/

A second, self-contained static Next.js marketing site with its own `package.json`, `bun.lock`,
`tsconfig.json`, ESLint config and Tailwind setup. It is not a workspace of the root package, the
root `tsconfig.json` `include` does not sweep it, and `bun run check` never touches it — build it
with `cd mlai-web && bun install && bun run build`, which exports static HTML to `mlai-web/docs/`.
`.github/workflows/mlai-web.yml` lints, typechecks, builds and verifies the exported routes, scoped
by path so it only fires when `mlai-web/**` changes. It duplicates pages the application already
serves from `src/app/(public)/`; confirm which of the two a request means before editing anything
that sounds like "the MLAI site".
