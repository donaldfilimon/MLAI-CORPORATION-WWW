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
- [~] LibreOffice 26.8 installed (`brew install --cask libreoffice`; `soffice` on
      PATH). `bun run setup` in `apps/website-app` now verifies 20 of 23 formats
      and writes `.data/capabilities.json`, but still exits 1: `.doc`, `.xls` and
      `.ppt` fail because the macOS extraction sandbox profile also denies the
      local Unix-domain socket that LibreOffice 26.8 opens at startup. The bare
      `soffice` call converts the fixture in 1.7 s; the same call under
      `sandbox-exec` exits 1 with no output; re-allowing local Unix sockets in
      the profile makes it pass. The change touches `scripts/worker.ts:128`,
      `worker/validate_formats.py:15` and one `CLAUDE.md` sentence, and it
      loosens a sandbox, so it waits for Donald's decision.

## Still Donald's

- Retiring the `MLAI-CORPORATION-WWW` second checkout.
- Clearing the GitHub billing lock. Hosted CI and the Pages redeploy will not run
  until it is cleared.
- The iCloud download slip noted above (about 120 MB of `.git`/`.next` data now
  local under `~/Documents/files/mlai-site-{final,from-design}`).
