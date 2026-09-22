# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` is the canonical repository-wide map: the one Next app, the Quasar
service sidecar, the root commands, and what each gate does and does not prove.
Read it first, then the guidance for the surface you are changing. Do not
duplicate their detailed instructions here.

> **Merged and read-only (2026-09-22):** quesar.cloud
> ([`donaldfilimon/quesar.cloud`](https://github.com/donaldfilimon/quesar.cloud),
> local `~/dev/active/quesar.cloud`) is the main site. Every mlai surface was
> merged there at `8077dd1` (row-by-row record: `docs/merge/gap-matrix.md`
> in that repo). Nothing here is archived or deleted; do not develop here.

| Surface | Read before editing |
|---|---|
| `apps/mlai` | `apps/mlai/AGENTS.md`, `apps/mlai/CLAUDE.md`, and `apps/mlai/infra/README.md` for OpenTofu |
| `apps/quasar` | `apps/quasar/README.md` — the service sidecar has no `AGENTS.md` or `CLAUDE.md` |
| `sidecars/python-worker` | `sidecars/python-worker/README.md` |
| `packages/*` | that package's own `README.md`; `packages/trailer-engine` has none, so read its `src/index.ts` exports |

`apps/mlai` is the production Next.js app. Other trees by older names exist
elsewhere on this machine (`~/CLAUDE.md` maps them), so confirm which one a
request means before editing.

## Root commands

The root is orchestration only. These are the scripts it owns; anything more
specific belongs to an app and runs from that app's own directory. Use Bun
1.4, never npm, pnpm, or yarn.

```bash
bun run install:all      # bun install at the root: every workspace, one bun.lock (non-frozen)
bun run check            # check:topology, check:workflows, check:tooling, then web, then quasar
bun run check:topology   # bun packages/tooling/src/check-topology.ts
bun run check:workflows  # pinned Actionlint 1.7.12 via Go (requires Go 1.25+)
bun run check:tooling    # repository wrapper regression tests
bun run check:web        # cd apps/mlai && lint && test && build
bun run check:quasar     # apps/quasar typecheck && bun test packages
bun run dev:web          # cd apps/mlai && bun run dev
bun run tokens:generate  # bun packages/design-tokens/src/generate.ts
```

`AGENTS.md` (*Gate boundaries*) records what each gate does and does not
prove, plus how to focus a single test in each app. Read it before reporting
any gate result: a green `check:web` is not a signed-device CloudKit sync, a
green `check:quasar` is not a live provider acceptance pass, and no local
gate is a hosted deployment.

## Cross-app facts

Each of these takes several files to reconstruct, so they are recorded here
rather than inside one app's docs.

- **One root Bun workspace, isolated linker.** The workspace list is
  `packages/*`, `apps/mlai`, `apps/quasar`, `apps/quasar/packages/*` (deliberately
  no `apps/*` glob); `apps/quasar/templates/next-site` stays outside it with its
  own lockfile because it is copied per generated site. `bunfig.toml` sets
  `linker = "isolated"`. Install at the root, never inside an app (there are no
  app lockfiles, and `check:topology` rejects them). Only declared dependencies
  resolve, so an import that worked through another package's dependencies
  fails; declare it. `bunfig.toml`'s `hoistPattern` keeps `@types/react` and
  `@types/react-dom` out of Bun's hidden fallback so third-party `react` type
  imports resolve to the root `package.json`'s pin; don't switch the linker to
  `hoisted` without re-running typecheck.

- **The test runner differs per app.** `apps/mlai`'s `test` script runs Vitest
  (`vitest run`) then `bun test --preload ./tests/preload.ts ./tests/app.test.tsx`
  for the store/workspace/sidecar/research checks; a bare `bun test` in that
  directory invokes Bun's own runner instead and skips the Vitest half.
  `apps/quasar`'s `test` script is `bun run --cwd apps/quasar typecheck && test`
  (typecheck first, then `bun test packages`).
- **`check:topology` requires this file to exist.**
  `packages/tooling/src/check-topology.ts` lists root `AGENTS.md`,
  `CLAUDE.md`, and `README.md` among its required paths, so renaming or
  removing one fails the first gate in `bun run check`. Beyond required paths
  it only rejects app lockfiles, nested `workspaces` fields, a non-isolated
  linker, and a directory whose two guides do not name exactly one canonical
  file in their opening lines; it compiles no contracts and validates no
  content.
- **`@mlai/contracts` is a type-only vocabulary, currently consumed only by
  `apps/mlai`** (`src/index.css`, `src/components/site/accent.ts`, and the
  `design-sync`/`design-tokens` tests under `src/__tests__/`), all as
  `import type`. `@mlai/design-tokens` (`packages/design-tokens`) holds the raw
  Lab palette; per its own README, web maps it to static Tailwind class names,
  and mobile used to map it to React Native theme values before the mobile app
  was folded into the single-app merge — that mapping is currently unused.
  `apps/mlai/src/__tests__/design-tokens.test.ts` still pins web's copy against
  the package, so change both together and run `check:web`. `@mlai/trailer-engine`
  is the shared package with the most runtime code: `apps/mlai` depends on it via
  `workspace:*`, it exports raw `.ts` source, and the film/trailer code under
  `apps/mlai/src/film` and `apps/mlai/src/abbey-trailer` (plus their
  `film-*`/`abbey-trailer` tests) import it. A change there is web behavior, so
  run `check:web`, not only `check:tooling`.
- **A green local `bun run check` does not prove CI's install step.**
  `.github/workflows/ci.yml` runs four jobs: `topology`, `web`, `quasar`, and
  `check (self-hosted)` (the full `bun run check` on the runner labelled
  `self-hosted, macOS, ARM64, mlai`, same-repository pushes/dispatches/PRs only
  — `.github/self-hosted-runner.md`). `web` and `quasar` each run a frozen
  install at the repository root filtered to `@mlai/platform` plus their own
  workspace, and `topology` runs
  `bun install --frozen-lockfile --lockfile-only` as the drift check, while
  `install:all` is deliberately non-frozen. Lockfile drift therefore surfaces
  in CI, or locally only if you run that same command.
- **CI's hosted jobs and the self-hosted queue can both be unmeasured, not
  red.** Hosted jobs have failed in 2–3 seconds with zero steps under an
  account billing lock in the past; that state means the run is unmeasured,
  not that the gate failed — re-check with
  `gh api repos/donaldfilimon/MLAI-CORPORATION-WWW/actions/runners --jq .total_count`
  before trusting either a red hosted check or a `check (self-hosted)` stuck
  `queued`/`cancelled`. Because CI then never concludes `success`, `pages.yml`
  and `deploy-cloudrun.yml` never publish or deploy: `workflow_run` fires them
  on any CI completion, but their jobs gate on `conclusion == 'success'` from a
  same-repository push and are skipped, and Cloud Run additionally soft-skips
  through its `readiness` job until `vars.WIF_PROVIDER` and `vars.GCP_PROJECT_ID`
  exist. An un-republished Pages site or a skipped deploy is expected in that
  state; never change code to satisfy either.
- **`apps/mlai/site/` is a separately published artifact, not a build output.**
  GitHub Pages publishes it from `.github/workflows/pages.yml` with Actions as
  the source; the legacy `gh-pages` branch is retired and must not be
  recreated. Some brand assets exist in both `apps/mlai/public/` and
  `apps/mlai/site/`, and regenerating the `public/` copies does not touch the
  `site/` ones.

## Trees that are not apps

- **`docs/sources/` is frozen reference, never a place to edit.** It holds the
  MLAI prototype trees consolidated on 2026-09-16, with their manifests,
  lockfiles and agent guides renamed to `*.source` so nothing there installs,
  builds, lints or raises dependency alerts. Its `README.md` and `SHA256SUMS`
  record provenance and removals. A fix belongs in `apps/`, not in a copy here.
- **`apps/quasar-web-old-bak/` is tracked evidence, not an app.** It holds only
  `output/playwright/journeys-web-20260908-*` receipts and screenshots from the
  four-app journey acceptance, committed 2026-09-18. It is not a workspace
  member, no gate reads it, and `check:topology` deliberately avoids an
  `apps/*` glob so it is not mistaken for one. Do not extend it, build in it,
  or remove it on your own.
- **Two `GEMINI.md` files, two roles.** The root one is a short redirect to
  `AGENTS.md`; keep it that way. `apps/mlai/GEMINI.md` is a full app guide kept
  aligned with that app's `AGENTS.md`/`CLAUDE.md` by its `ai-tooling-sync`
  skill — content-synced, not byte-identical, so a durable change gets ported
  into each file's own voice rather than pasted verbatim. `check:topology`
  inspects neither `GEMINI.md` file, so drift there is not gated.

## Local preview

`.claude/launch.json` is local to this machine (listed in `.git/info/exclude`,
not tracked). It names one preview server, `mlai-web`, which runs `next dev` in
`apps/mlai` with `autoPort` so a second session gets its own port instead of
colliding with `bun run dev:web`'s fixed `--port 3000`. Two separate identity
systems gate different parts of the app: WorkOS for the public-site login and
console/admin surfaces (redirects to `APP_URL`, default `http://localhost:3000`),
and Better Auth (via `@mlai/store`, needs a reachable local Postgres at
`DATABASE_URL`) for `/app/*` only — see `apps/mlai/AGENTS.md` for the full
detail on both. The Quasar service listens on 4700 and is not started by
`dev:quasar` (see `AGENTS.md`).

<!-- machine-git-policy -->
## Git workflow (machine policy, 2026-08-27)

Work on the default branch in this canonical checkout. Do not create
branches or worktrees by default; they are for tasks that genuinely need
isolation, or when Donald asks. Any worktree or topic branch created here
must be merged back into this checkout's default branch, the worktree
removed, and the branch deleted, before pushing and before the task is
called done. Full policy: `~/.claude/CLAUDE.md` (*Git discipline*).
<!-- /machine-git-policy -->
