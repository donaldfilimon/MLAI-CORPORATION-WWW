# AGENTS.md

This is the canonical MLAI integration guide; `CLAUDE.md` points here. Read the
app-local `AGENTS.md` for web/mobile/website-app and `apps/quasar/README.md` for Quasar.

## Boundaries

- `apps/quasar-web` is the canonical Next.js website. Do not restore the retired
  mobile `www/` snapshot or collapse the website into an Expo static mock.
- `apps/mobile` is the Expo companion. Preserve its native CloudKit versus
  encrypted-local fallback distinction and its signed-device acceptance gap.
- `apps/quasar` holds Quasar's service, shared package and Expo app, which are
  members of the root workspace, plus `templates/next-site`, which stays
  outside it with its own lockfile because it is copied per generated site.
- `apps/website-app` is the imported local Next.js application. Keep its shared
  UI, agent scaffold, SQLite/Better Auth, worker and Python lockfile together.
  Run its commands from that app directory.
- `apps/research-sites` is the generated static export of the research
  collection, imported with its history on 2026-09-16. It has zero
  dependencies and no install step. Never hand-edit its `public/`: regenerate it
  with `apps/quasar-web/scripts/export-research.tsx` and keep the manifest provenance.
- `packages/contracts` contains names and types, not publishable benchmark
  values. App content sources remain authoritative for copy and figures.
- `packages/tooling` holds repository checks and the isolated website-app gate
  wrapper. `check:topology` runs `bun packages/tooling/src/check-topology.ts`.
- The root is orchestration only. Run app-native gates independently and report
  their results independently.
- Every app except `apps/research-sites` (no dependencies) and the Quasar
  template installs through one root Bun workspace: one root `bun.lock`, no app
  lockfiles, `linker = "isolated"` in the root `bunfig.toml`. The workspace list
  in the root `package.json` names each member; there is deliberately no
  `apps/*` glob.
- The React type graphs still differ: the Next apps use React 19.2 types and
  the Expo apps use SDK 53's 19.0 types. The isolated linker gives each app its
  own view, and two mechanisms keep third-party declarations (which often
  import `react` without depending on `@types/react`) on the right copy. The
  root `package.json` pins the Next-side `@types/react`/`@types/react-dom` and
  `bunfig.toml`'s `hoistPattern` keeps those two out of Bun's hidden fallback
  directory, so such declarations resolve to the root pin. Each Expo app
  typechecks through `tsconfig.typecheck.json`, which maps `react` to its own
  types. Do not remove either mechanism, and never switch the linker to
  `hoisted` without re-running every app's typecheck.
- The isolated linker exposes only declared dependencies. Declare every
  package an app or its scripts import; do not rely on another package's
  dependencies being reachable.

## Commands

Use Bun 1.4 (`packageManager` and CI), not npm, pnpm, or yarn. The lockfile is
`lockfileVersion: 2`; Bun 1.3 rewrites it instead of failing.

```bash
bun run install:all      # bun install at the root (every workspace)
bun run check            # aggregate gate: check:topology && check:workflows && check:tooling && check:web && check:mobile && check:quasar && check:website-app && check:research-sites
bun run check:topology
bun run check:workflows
bun run check:tooling
bun run check:research-sites
bun run check:web
bun run check:mobile
bun run check:quasar
bun run check:website-app

bun run dev:web          # cd apps/quasar-web && bun run dev
bun run dev:mobile       # cd apps/mobile && bun run start
bun run dev:website-app  # cd apps/website-app && bun run dev
bun run dev:quasar       # cd apps/quasar/apps/quasar && bun run start
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
- `check:web`: `lint` is `tsc --noEmit`, then Node-only Vitest, then sitemap/llms
  generation and Next build. From `apps/quasar-web`, focus with
  `bun run test src/__tests__/landing-page.test.ts`; do not substitute `bun test`.
- `check:mobile`: TypeScript, Jest in-band, Expo lint, Expo **web** export.
  From `apps/mobile`: `bun run test __tests__/cloud.test.ts --runInBand`.
- `check:quasar`: the three Quasar typechecks (`@quasar/*` and `quasar-app`),
  `bun test packages`, then Expo **web** export from `apps/quasar/apps/quasar`. From `apps/quasar`, focus with
  `bun test packages/service/src/paths.test.ts` (Bun's runner, unlike web/mobile).
- `check:research-sites`: `bun test` plus `bun run build`, which verifies the
  clean manifest, exact file inventory and every file hash before copying
  `public/` to the ignored `out/`.
- `check:website-app`: serial database migration, UI build, TypeScript, Vitest,
  Python pytest and Next build. Both stages share a temporary `MLAI_DATA_DIR`
  removed on exit; a nonempty explicit override is preserved and may be modified
  by migration/checks. Run app setup first for parser/model dependencies.
  CI covers formatting, research validation, TypeScript, Vitest, migration and
  build; it does not cover pytest, Playwright, or live integrations. The nested
  agent scaffold remains non-deployable under its own `AGENTS.md`.
- The root workspace lists Quasar's `packages/*` and `apps/*`;
  `templates/next-site` has its own lockfile and is not built by that aggregate
  gate.
- CI covers seven jobs: topology, web, mobile, quasar, website-app,
  research-sites, and `check (self-hosted)` (full gate on the `mlai`-labelled
  macOS runner; same-repository events only). Hosted runs have been blocked
  by a billing lock since 2026-09-08, so a red hosted check after that date
  is unmeasured, not a failing gate; while no runner is registered the
  self-hosted job queues and is then cancelled (next push, or the 24-hour
  queue limit), which is equally unmeasured.
- `dev:quasar` starts only the Expo app. Start the service separately from
  `apps/quasar` with `bun run --filter '@quasar/service' start`; see its README
  for the unauthenticated LAN listener and provider-dependent acceptance flow.

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

- **GitHub Pages** publishes the static companion in `apps/quasar-web/site/` via `.github/workflows/pages.yml` (Actions only). The legacy `gh-pages` branch is retired; do not recreate it for deploys.
