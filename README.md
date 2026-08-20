# Quasar

Quasar is an AI website builder: describe a site in a prompt, Claude scaffolds
and writes a real **Next.js 15 App Router** project, and you preview it live
on your own machine. **v1** is intentionally small — a local Bun service plus
an Expo app that drives it. There is no deploy step yet; "preview" means
`next dev` running on your Mac.

Quasar is the first slice of a larger, staged plan (see the design spec) —
deploy adapters, hosting, auth, and a templates gallery are explicitly out of
scope here.

## Architecture

Four Bun workspaces:

```
packages/shared      TypeScript types + zod schemas shared by service and app
                      (Site, GenerationEvent, PreviewStatus, request bodies)
packages/service      local Bun service (Bun.serve, default port 4700):
                      registry, path guard, site filesystem tools, the
                      generation engine, the scaffolder, and the preview
                      manager
templates/next-site   a buildable, checked-in minimal Next.js 15 + Tailwind v4
                      starter — copied per-site as the generation baseline
apps/quasar           Expo SDK 53 / React 19 / Expo Router app (web + iOS +
                      Android): sites list, new-site form, live generation
                      feed + preview, settings
```

**Data flow:**

1. The app POSTs `{name, prompt}` to `/api/sites`. The service reserves a
   registry slot, copies `templates/next-site` into
   `~/.quasar/sites/<slug>/`, and starts a generation job.
2. The generation engine (`packages/service/src/engine.ts`) drives the
   Anthropic SDK's Tool Runner against three tools — `list_files`,
   `read_file`, `write_file` — all path-guarded so writes can never escape
   the site directory. Every tool call and text delta is pushed onto a
   per-site in-memory event buffer.
3. The app polls `GET /api/sites/:id/events?since=N` to render the feed. The
   design spec specifies this as an SSE stream with events buffered per job
   so a late-attaching client can catch up; v1 implements that same buffered
   catch-up semantics as a JSON cursor the client polls (`?since=N` →
   `{events, next}`) rather than an actual `EventSource`/SSE connection —
   pure SSE framing is deferred.
4. `POST /api/sites/:id/preview/start` spawns `next dev` for that site on an
   allocated port (4710+), health-checks it by polling `http://localhost:<port>/`
   for a 200, and returns a status with the URL; the app opens it in an
   iframe (web) or via `Linking` (native, rewriting `localhost` to the
   Settings-configured host so it resolves correctly from a phone on the
   LAN).
5. Data lives entirely on disk under `~/.quasar/` (a registry JSON file plus
   one real, editor-openable Next.js project per site) and in the Anthropic
   account behind whatever credential the service resolves. There is no
   database and no Quasar-hosted backend.

Each site directory is a normal Next.js project — open it in an editor,
`git init` it, run its own `bun run dev` — Quasar's service is just the thing
that wrote it and that you use for the driven experience.

## How to run

```bash
bun install
```

**Start the service** (needs Anthropic credentials — either set
`ANTHROPIC_API_KEY` in the environment or run `ant auth login` first; the
service never stores or proxies a key of its own):

```bash
bun run --filter '@quasar/service' start
```

This serves on `http://localhost:4700` by default (`PORT` overrides it) and
binds to `0.0.0.0`, so it's reachable from other devices on the same LAN.
Site data and the registry live under `~/.quasar` (`QUASAR_HOME` overrides
this).

**Start the app** (dev, web target):

```bash
cd apps/quasar && bun run web
```

Or build a static export: `bunx expo export --platform web`.

**Reaching the service from a phone:** the app defaults its base URL to
`http://localhost:4700`, which only works when the app and service share a
loopback interface (i.e. the web target on the same machine as the service).
To drive the service from an iOS/Android device, find your Mac's LAN IP
(`ipconfig getifaddr en0` or similar) and enter
`http://<that-ip>:4700` in the app's **Settings** screen. That value is kept
in memory only for the current app session — it resets to the default the
next time the app starts.

## Manual acceptance flow

This is what "it works end to end" means for v1; run it after any change
that touches the service or app:

1. Start the service and the app.
2. On the sites list, create a new site with a name and a prompt.
3. Watch the live generation feed on the site's detail screen (text
   narration + a file-write ticker) until it reaches `done`.
4. Start the preview and open it — web shows it in an iframe, native opens it
   via the device's browser.
5. Submit an edit prompt (disabled while a job is already running) and watch
   the second job stream.
6. Reload the preview and confirm the edit is visible.

## v1 status and limitations

**Verified by this build:** `bun install`, `bun run typecheck` (all three
TypeScript workspaces), `bun run test` (56 `bun:test` cases across 10 files —
path guard, site filesystem tools, registry atomicity, port allocation,
event buffering, scaffold, preview manager, HTTP routing, and a
mocked-client engine test; the preview-manager tests do spawn real local
processes and poll `localhost`, but nothing in the suite calls the Anthropic
API or needs credentials), and `bunx expo export --platform web` for
`apps/quasar` all pass clean as of this task.

**Not exercised in this build environment:** a real end-to-end generation
run against the live Anthropic API. The engine's tool loop, path guard, and
error mapping are unit-tested against a mocked client, but no run in this
environment has held a valid `ANTHROPIC_API_KEY` / `ant auth login` session
to actually call Claude, scaffold a real prompt, and preview the result. The
manual acceptance flow above is the way to close that gap on a machine that
has credentials configured.

**Known v1 constraints, by design:**

- **Local-only.** No deploy targets or hosting — "preview" is `next dev` on
  your machine. Closing your laptop stops every preview.
- **No database.** State is a JSON registry file plus one directory per site
  on disk; there's no multi-user or remote sync story.
- **Events are polling, not push.** The design spec called for an SSE
  stream; v1 ships the same buffered-catch-up semantics as a JSON cursor the
  app polls (`GET /api/sites/:id/events?since=N`) instead — see "Data flow"
  above. Pure SSE framing is deferred, not abandoned.
- **One generation job per site at a time** — an edit while a job is running
  gets a 409.
- **No auth, no multi-user, no billing** — anyone who can reach the service's
  port (loopback, or your LAN if you've shared the IP) can drive it.

## Docs

- Design spec: `docs/superpowers/specs/2026-08-19-quasar-v1-design.md`
- Implementation plan: `docs/superpowers/plans/2026-08-19-quasar-v1.md`
- Task ledger: `tasks/todo.md`
