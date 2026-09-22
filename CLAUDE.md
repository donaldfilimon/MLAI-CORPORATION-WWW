# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` is the canonical repository-wide map: the one Next app, the Quasar
service sidecar, the root commands, and what each gate does and does not prove.
Read it first, then the guidance for the surface you are changing. Do not
duplicate their detailed instructions here.

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
```

`AGENTS.md` (*Gate boundaries*) records what each gate does and does not
prove, plus how to focus a single test in each app. Read it before reporting
any gate result: a green web gate is not mobile evidence, a green Expo export
is not a signed CloudKit run, and no local gate is a hosted deployment.

## Cross-app facts

Each of these takes several files to reconstruct, so they are recorded here
rather than inside one app's docs.

- **One root Bun workspace, isolated linker.** Every app except
  `apps/research-sites` and the Quasar template installs from the root
  `bun.lock`; `bunfig.toml` sets `linker = "isolated"`. Install at the root,
  never inside an app (there are no app lockfiles, and `check:topology`
  rejects them). Only declared dependencies resolve, so an import that worked
  through another package's dependencies fails; declare it. The Next and Expo
  apps still use different React types: the root `package.json` pins the Next
  side's `@types/react`, `bunfig.toml`'s `hoistPattern` makes undeclared
  `react` type imports fall through to that pin, and each Expo app typechecks
  through its `tsconfig.typecheck.json`, which maps `react` to its own SDK 53
  types. `AGENTS.md` explains both; keep both.

- **The test runner differs per app, and the wrong invocation fails quietly.**
  `bun run test` is Vitest in `apps/quasar-web` and Jest in `apps/mobile`; a bare
  `bun test` in either one invokes Bun's own runner instead and does not run
  the suite you meant. `apps/quasar` is the exception: its `test` script
  genuinely is `bun test packages`. `apps/website-app` adds a runtime trap:
  Bun is its package manager only, and every script runs on Node through
  `node --import tsx` (`better-sqlite3` is a native Node addon), so use
  `bun run <script>`, never `bun scripts/<x>.ts`.
- **`check:topology` requires this file to exist.**
  `packages/tooling/src/check-topology.ts` lists root `AGENTS.md`,
  `CLAUDE.md`, and `README.md` among its required paths, so renaming or
  removing one fails the first gate in `bun run check`. Beyond required paths
  it only rejects app lockfiles, nested `workspaces` fields, a non-isolated
  linker, and a directory whose two guides do not name exactly one canonical
  file in their opening lines; it compiles no contracts and validates no
  content.
- **`@mlai/contracts` is a type-only vocabulary shared by two apps.** Web and
  mobile each consume it through a `workspace:*` dependency,
  and every use in app source is an `import type`
  (`apps/quasar-web/src/components/site/accent.ts`,
  `apps/mobile/lib/brand.ts`, `apps/mobile/lib/theme.ts`).
  `@mlai/design-tokens` holds the five raw Lab hex colors (`labColor`) and is
  a **runtime** import in both Expo `lib/theme.ts` files, so a change there
  reaches mobile and Quasar. Web keeps the same values in `src/index.css`;
  `apps/quasar-web/src/__tests__/design-tokens.test.ts` fails if the two drift, so
  change both together and run `check:web`, `check:mobile` and
  `check:quasar`. Semantic tokens stay app-local. `@mlai/trailer-engine` is
  the shared package with the most runtime code: `apps/quasar-web` depends on it via
  `workspace:*`, it exports raw `.ts` source, and the
  film/trailer code in `apps/quasar-web/src/film` and `apps/quasar-web/src/abbey-trailer`
  plus their `film-*`/`abbey-trailer` tests import it. A change there is web
  behavior, so run `check:web`, not only `check:tooling`.
- **A green local `bun run check` does not prove CI's install step.**
  `.github/workflows/ci.yml` runs topology, web, mobile, quasar, website-app,
  and research-sites as six independent hosted jobs, plus a seventh,
  `check (self-hosted)`, that runs the full `bun run check` on the runner
  labelled `self-hosted, macOS, ARM64, mlai` for same-repository pushes,
  dispatches and PRs only (`.github/self-hosted-runner.md`). The four app jobs with
  dependencies each run a frozen install at the repository root, filtered to
  `@mlai/platform` plus their own workspaces (research-sites has no install
  step by design), and the topology job runs
  `bun install --frozen-lockfile --lockfile-only` as the drift check, while
  `install:all` is deliberately non-frozen. Lockfile drift therefore surfaces
  in CI, or locally only if you run that same command.
- **Two CI states are unmeasured, not red.** Hosted jobs fail in 2–3 seconds
  with zero steps under the account billing lock (since 2026-09-08). While no
  runner is registered, `check (self-hosted)` sits `queued`, then ends
  `cancelled`: by the next push to `main` (`cancel-in-progress`) or by
  GitHub's 24-hour queue limit (both observed 2026-09-19). Re-measure with
  `gh api repos/donaldfilimon/MLAI-CORPORATION-WWW/actions/runners --jq .total_count`
  (0 on 2026-09-22). Because CI then never concludes `success`, `pages.yml`
  and `deploy-cloudrun.yml` never publish or deploy: `workflow_run` fires
  them on any CI completion, but their jobs gate on
  `conclusion == 'success'` from a same-repository push and are skipped, and
  Cloud Run additionally soft-skips through its `readiness` job until
  `vars.WIF_PROVIDER` and `vars.GCP_PROJECT_ID` exist. An un-republished
  Pages site or a skipped deploy is expected; never change code to satisfy
  either.
- **`apps/quasar-web/site/` is a separately published artifact, not a build output.**
  GitHub Pages publishes it from `.github/workflows/pages.yml` with Actions as
  the source; the legacy `gh-pages` branch is retired and must not be
  recreated. Some brand assets exist in both `apps/quasar-web/public/` and
  `apps/quasar-web/site/`, and regenerating the `public/` copies does not touch the
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
  `AGENTS.md`; keep it that way. `apps/quasar-web/GEMINI.md` is a full app guide
  kept aligned with that app's `AGENTS.md`/`CLAUDE.md`/`README.md` by its
  `ai-tooling-sync` skill, so a durable web change lands in all four.
  `check:topology` inspects neither file, so drift there is not gated.

## Local preview

`.claude/launch.json` is local to this machine (listed in `.git/info/exclude`,
not tracked). It names two preview servers that differ from the `dev:*`
scripts. `mlai-web` runs `next dev` in `apps/quasar-web` with `autoPort`, so a
second session gets its own port instead of colliding; it bypasses the `dev`
script because that script hardcodes `--port 3000`. `mlai-website-app` runs
`apps/website-app`'s `dev` on 3100, taken from `scripts/dev.ts`. A real WorkOS
sign-in returns to `APP_URL` (default `http://localhost:3000`), so use
`bun run dev:web` on 3000 for that flow. The Quasar service listens on 4700 and
is not started by `dev:quasar` (see `AGENTS.md`).

<!-- machine-git-policy -->
## Git workflow (machine policy, 2026-08-27)

Work on the default branch in this canonical checkout. Do not create
branches or worktrees by default; they are for tasks that genuinely need
isolation, or when Donald asks. Any worktree or topic branch created here
must be merged back into this checkout's default branch, the worktree
removed, and the branch deleted, before pushing and before the task is
called done. Full policy: `~/.claude/CLAUDE.md` (*Git discipline*).
<!-- /machine-git-policy -->
