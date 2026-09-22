# AGENTS.md

This is the canonical MLAI integration guide; `CLAUDE.md` points here. Read
`apps/mlai/AGENTS.md` for the Next app and `apps/quasar/README.md` for the
Quasar service sidecar.

## Boundaries

One Next 16 app at `apps/mlai` serves the public site, `/app/*`, and the Quasar
screens. A Capacitor shell loads that app. Better Auth sessions use the Postgres
side of `@mlai/store`, gating `/app/*` only — WorkOS remains the identity
system for the rest of the app (login/console/admin) until the design record's
retirement decision is actually executed in code. Episode, receipt, and vector
reads use the WDBX side and fail closed when the gateway is absent. The
decision record is `docs/superpowers/specs/2026-09-22-single-app-merge-design.md`.

- `apps/mlai` is the only Next.js app. Do not add a second one.
- `apps/quasar` keeps `@quasar/service` and `@quasar/shared`. The service is an
  optional URL sidecar. `templates/next-site` stays outside the workspace with
  its own lockfile because it is copied per generated site.
- `sidecars/python-worker` is the Python document worker, also reached only by
  configured URL. The app does not spawn it.
- The research collection ships as `apps/mlai/research/public`. Do not hand-edit
  it. `bun run build` in `apps/mlai` verifies the manifest inventory and file
  hashes, then copies them to the ignored `research/out`.
- `packages/contracts` contains names and types, not publishable benchmark
  values. App content sources remain authoritative for copy and figures.
- `packages/tooling` holds repository checks. `check:topology` runs
  `bun packages/tooling/src/check-topology.ts`.
- The root is orchestration only. Run app-native gates independently and report
  their results independently.
- Installs go through one root Bun workspace: one root `bun.lock`, no app
  lockfiles, `linker = "isolated"` in the root `bunfig.toml`. The workspace list
  in the root `package.json` names each member; there is deliberately no
  `apps/*` glob.
- `bunfig.toml` `hoistPattern` keeps `@types/react` and `@types/react-dom` out of
  Bun's hidden fallback so third-party `react` type imports resolve to the root
  pin. Do not switch the linker to `hoisted` without re-running typecheck.
- The isolated linker exposes only declared dependencies. Declare every
  package an app or its scripts import; do not rely on another package's
  dependencies being reachable.

## Commands

Use Bun 1.4 (`packageManager` and CI), not npm, pnpm, or yarn. The lockfile is
`lockfileVersion: 2`; Bun 1.3 rewrites it instead of failing.

```bash
bun run install:all      # bun install at the root (every workspace)
bun run check            # check:topology && check:workflows && check:tooling && check:web && check:quasar
bun run check:topology
bun run check:workflows
bun run check:tooling
bun run check:web        # cd apps/mlai && lint && test && build
bun run check:quasar     # @quasar/* typecheck, then bun test packages

bun run dev:web          # cd apps/mlai && bun run dev
```

For focused work, change into the affected app and follow its local docs. Never
claim CloudKit, Cloud Run, GitHub Pages, or a live Anthropic generation from a
local build alone.

## Gate boundaries

- `install:all` is a plain, non-frozen `bun install` at the root. Each CI job
  installs at the root with `bun install --frozen-lockfile --filter
  @mlai/platform --filter <its workspaces>`, and the topology job runs
  `bun install --frozen-lockfile --lockfile-only`, which fails when a manifest
  changed without the matching `bun.lock` update.
- `check:topology` checks that required paths exist (root `bun.lock` and
  `bunfig.toml`, every workspace manifest, both Metro configs and both Expo
  typecheck configs), that no app lockfile exists, that no nested manifest
  declares `workspaces`, and that the isolated linker is set. For the root and
  each app directory holding both `AGENTS.md` and `CLAUDE.md`, it also requires
  that exactly one declares itself canonical within its first 15 lines and the
  other names it (`` `AGENTS.md` is canonical ``); a directory with one guide or
  none passes (`apps/quasar` keeps only `README.md`). It does not compile
  contracts or validate content, lockfile drift, or app behavior.
- `check:workflows` runs pinned Actionlint 1.7.12 via Go (Go 1.25+ required;
  first run downloads the module). It checks workflow syntax and expressions,
  with optional ShellCheck and Pyflakes disabled.
- `check:tooling` runs `bun test packages/tooling/src` for repository wrapper
  regressions; the aggregate gate and CI topology job include it.
- `check:web`: `lint` is `tsc --noEmit`, then Vitest plus the Bun tests in
  `apps/mlai/tests`, then sitemap generation, the research hash check, and the
  Next build. From `apps/mlai`, focus Vitest with
  `bunx vitest run src/__tests__/landing-page.test.ts`. `bun test tests` is the
  store, workspace, sidecar, and research check; it is not a substitute for Vitest.
- `check:quasar`: typecheck `@quasar/*`, then `bun test packages`. From `apps/quasar`,
  focus with `bun test packages/service/src/paths.test.ts`.
- `templates/next-site` has its own lockfile and is not built by the aggregate gate.
- CI covers topology, web, quasar, and `check (self-hosted)` (full gate on the
  `mlai`-labelled macOS runner; same-repository events only). Hosted runs have
  been blocked by a billing lock since 2026-09-08, so a red hosted check after
  that date is unmeasured, not a failing gate; while no runner is registered the
  self-hosted job queues and is then cancelled (next push, or the 24-hour
  queue limit), which is equally unmeasured.
- Start the Quasar service separately from `apps/quasar` with
  `bun run --filter '@quasar/service' start`. See its README for the
  unauthenticated LAN listener and provider-dependent acceptance flow. A local
  build does not prove a signed-device CloudKit sync.

## Documentation

Root documents describe topology and cross-app rules. App documents describe
app architecture and commands. Avoid copying long app instructions into the
root; link to the authoritative file so the copies cannot drift.

<!-- machine-git-policy -->
## A second full checkout of this repository exists (archived since 2026-09-18)

`~/dev/active/mlai` is the canonical checkout. A second full checkout, created
deliberately on Donald's explicit choice (not a worktree, not a mistake to clean
up), was moved with 22 other projects from `~/dev/active/MLAI-CORPORATION-WWW` to
`~/Archive/experimental-2026-09-18/MLAI-CORPORATION-WWW` on 2026-09-18. It is
restore-only there: do not develop in it. If it is ever restored, the rules below
apply again, so they stay recorded:

- A commit made in one checkout is **invisible to the other until it is pushed and
  fetched**. Always `git fetch` in the other before trusting any ahead/behind
  count, and never compare them without doing so.
- **Never edit the same file in both.** There is no shared index and no warning;
  the two simply diverge and the second push conflicts.
- The directory name matches the repository name, which is exactly why it is the
  tree most easily confused with `dev/active/mlai`. Confirm which one a request
  means before editing.

Note also that `apps/website-app` was imported from the separate repository
`donaldfilimon/mlai-website-app`. Everything through its `801bdad` was merged
here with history on 2026-09-16, and that repository has been archived
read-only on GitHub since the same day, so this tree is the only place to
develop the app. Provenance is in `docs/website-app-import-manifest.json`.

## Git workflow (machine policy, 2026-08-27)

Work on the default branch in this canonical checkout. Do not create
branches or worktrees by default; they are for tasks that genuinely need
isolation, or when Donald asks. Any worktree or topic branch created here
must be merged back into this checkout's default branch, the worktree
removed, and the branch deleted, before pushing and before the task is
called done. Full policy: `~/.claude/CLAUDE.md` (*Git discipline*).
<!-- /machine-git-policy -->

## GitHub Pages

- **GitHub Pages** publishes the static companion in `apps/mlai/site/` via `.github/workflows/pages.yml` (Actions only). The legacy `gh-pages` branch is retired; do not recreate it for deploys.
