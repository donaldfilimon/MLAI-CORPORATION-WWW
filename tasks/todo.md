# Todo: consolidate every MLAI tree into this repository

Goal: see `goals.md`. Measured and executed 2026-09-16 from `~/dev/active/mlai`.

- [x] **Claim and update this checkout.** The only peer session with this
      checkout in scope confirmed it held nothing here. The 2026-09-08 dirty
      work was checked byte for byte against
      `at-risk-bundles/mlai-dirty-20260916-0423`. Then stash, fast-forward 101
      commits to `ef8412b`, and pop. `883d634` holds the film engine and
      `@mlai/trailer-engine`, `1966d17` the design-sync notes, and `d813b3d` the
      trailer goal record. `check:web` gave 49 files and 436 tests, plus the build.
- [x] **Standalone `mlai-website-app` into `apps/website-app`.** Subtree merge
      `5edba1b` of `d988a218..801bdad`, with the 12 commits kept as ancestors.
      `check-website-app.sh` (17 files, 137 tests, 26 parser tests, build),
      `format:check` and `verify:research` all exit 0. Setup cannot finish on
      this machine without LibreOffice (`soffice`); the gate does not need it.
- [x] **`mlai-research-sites` into `apps/research-sites`.** History merge
      `e60f6d6` of `028e4fb`, plus `check:research-sites`, topology entries and a
      CI job.
- [x] **`~/Downloads/files{, (1)}`: nothing to import.** Both checkouts'
      commits are already in `main` (`files (1)`'s UX pass is `87e89e1`), and so
      are both loose patch series, the `-full.tar.gz` snapshots and the hero PNGs.
- [x] **Reference trees into `docs/sources/`** (`a0a92d3`): both design
      handoffs, the Downloads Next.js landing, `mlai-site-final` and
      `mlai-site-from-design` (with their uncommitted edits), the v2.4 export and
      source zip, `mlai-mobile 2`, and the master reference. `~/Documents/mlai-mobile`
      and the pre-monorepo archive were already contained in `main`.
- [x] Root `bun run check` exit 0 at `1b09043`, then `main` pushed. The lockfile
      fix `1b09043` was found by the frozen root install.

## Follow-ups done 2026-09-16 13:2x-13:3x (Donald's choices)

- [x] The 43 Dependabot alerts raised by the `docs/sources` manifests were
      dismissed as `not_used` after the `*.source` rename did not close them.
      One open alert remains: `apps/website-app/worker/uv.lock` (`accelerate`,
      no fixed version).
- [x] `donaldfilimon/mlai-website-app` archived on GitHub (read-only, reversible).
- [x] Both standalone checkouts moved, after fresh bundles
      (`mlai-website-app-final-20260916.bundle`, `mlai-research-sites-final-20260916.bundle`)
      and an owner sweep: `~/dev/archive/mlai-website-app-merged-20260916` and
      `~/dev/archive/mlai-research-sites-merged-20260916`. `project-registry`,
      `~/.claude/launch.json`, the `dev/active` maps and `~/CLAUDE.md` point at the new paths.
- [x] LibreOffice 26.8 installed (`brew install --cask libreoffice`; `soffice` on
      PATH). The first `bun run setup` verified 20 of 23 formats: `.doc`, `.xls`
      and `.ppt` failed because the macOS extraction sandbox profile also denied
      the local Unix-domain socket LibreOffice 26.8 opens at startup (bare
      `soffice` converted the fixture in 1.7 s; under `sandbox-exec` it exited 1
      with no output). On Donald's approval (14:0x) the profile in
      `scripts/worker.ts` and `worker/validate_formats.py` re-allows local Unix
      sockets while IP networking stays denied; `bun run setup` then exited 0
      with all 23 formats, `check-website-app.sh` exited 0 and `format:check` is
      green.

## Also done 2026-09-16 14:2x-14:3x

- [x] `project-registry` `projects.toml` archive paths committed (`796e20a`,
      local-only repo). 61 unit tests pass; `validate` stopped on a live writer
      under `~/Desktop/String`, unrelated. The `reports/*` refresh beside it is
      another session's and stays uncommitted.
- [x] `apps/web` gained a `NEXT_DIST_DIR` escape and both apps pin the
      `.next-gate` type globs (`526bdc3`, `a31e78c`), so a gate can build while
      a preview server runs without dirtying `tsconfig.json`.

## Open, recorded rather than fixed

- **Dependabot alert 5, `accelerate` 1.14.0 in `apps/website-app/worker/uv.lock`.**
  PyPI has 1.15.0 (2026-09-09), outside the advisory's `<= 1.14.0` range, but
  both upstream fix PRs (huggingface/accelerate #4070 and #4138) were closed
  unmerged and 1.15.0's commits contain neither; the range predates the
  release. Upgrading would silence the alert without fixing the flaw, so the
  lock stays. Re-check when a release ships the fix. Inference for Donald to
  confirm: the worker loads one pinned embedding model with
  `HF_HUB_OFFLINE=1`, not user-supplied sharded checkpoints, so the path the
  advisory describes is not reached. Dismissing it as tolerable risk is his call.

## Still Donald's

- Retiring the `MLAI-CORPORATION-WWW` second checkout. It was kept on his
  explicit earlier choice, so "complete all" was not read as reversing it.
- Clearing the GitHub billing lock. Hosted CI and the Pages redeploy will not run
  until it is cleared.
- Opening a GCP billing account and reconnecting the Vercel connector (the
  hosted provider goal).
- Listening to `/showcase/abbey`, a VoiceOver pass, and a visual review.
- Dismissing or accepting the `accelerate` alert.
- The iCloud download slip noted above (about 120 MB of `.git`/`.next` data now
  local under `~/Documents/files/mlai-site-{final,from-design}`); harmless, and
  `brctl evict` would return it to the cloud.
- After this session ends: `~/dev/active/mlai-website-app/` holds only the
  memory hook's `.remember/` and a `.claude/launch.json` copy the preview tool
  needed; both can go.

## Corrections, 2026-09-17 05:0x EDT (appended; the lines above are left as written)

- **Stale: "Dependabot alert 5 ... the lock stays."** `d1d76ae` (2026-09-16 21:5x)
  bumped `accelerate` to 1.15.0 on Donald's choice, and
  `gh api 'repos/donaldfilimon/MLAI-CORPORATION-WWW/dependabot/alerts?state=open' --jq length`
  now returns `0`. The "Dismissing or accepting the `accelerate` alert" item under
  *Still Donald's* is therefore closed. The reasoning above (1.15.0 contains
  neither upstream fix PR) is not re-verified here.
- **Stale: "`~/dev/active/mlai-website-app/` holds only ... both can go."** That
  git-less shell was moved to `~/Archive/2026-09-16-mlai-website-app-residual/` at
  2026-09-16 18:2x (recorded in `~/CLAUDE.md`).
- [x] **`apps/research-sites/README.md` named the old exporter location** (a
      residual of the workspace goal). The README and the template in
      `apps/web/scripts/export-research.tsx` now name
      `apps/web/scripts/export-research.tsx`. The generator rewrites the README
      only for a fresh (not already exported) destination, so the committed README
      is maintained by hand, and the two texts already differed before this fix.
