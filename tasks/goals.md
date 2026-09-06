# Goals

## Land the 2026-09-06 dependency bump safely
status: in_progress
- Scope: Donald bumped every dependency at 06:28 on 2026-09-06 (next 15.5.19→15.5.25,
  base-ui 1.6→1.8, lucide-react 1.21→1.41, framer-motion 12.40→12.43, zod 4.4→4.5,
  shadcn 4.11→4.21, vitest 4.1.9→4.1.11, typescript/@types) and asked to "fix".
- Compile gates were already green on the bump: `lint` (tsc), `test`, `build` all pass.
  The bump itself broke nothing.
- Runtime verification found the real defect, which predates the bump: the
  Content-Security-Policy in `next.config.ts` was one constant shared by dev and
  production, and it omits `'unsafe-eval'`. Next's React Refresh runtime evaluates
  strings as JavaScript, so **Fast Refresh was dead on every page in development**
  with `EvalError: ... violates the following Content Security Policy directive`.
  Fixed by extracting `buildCsp({ dev })` into `src/lib/csp.ts` and granting
  `'unsafe-eval'` in development only. Production CSP is byte-identical to before.
- Second defect found and fixed: `bun run crawl` reported **17 routes "ok" and exit 0
  while driving a no-op browser wrapper** — `visit()` laundered an unparseable payload
  into an empty-but-clean page. A dead harness produced a green gate. Routes with no
  payload are now `? dead` and fail the run.
- Residual (honest): `bun run crawl` has never actually run against a real browser on
  this machine — its `PWCLI` wrapper ships with the Claude `playwright` skill, which is
  not installed here (`~/.claude/skills/playwright/` is absent). It now exits 127 with
  an explanatory message instead of a raw Python traceback, but **the real link-integrity
  crawl remains unverified against this dependency bump**. Substituted a 34-route HTTP
  sweep plus `bun run smoke` (13/13) against both dev and production builds.
- Not done: nothing is pushed. `main` carries 6 pre-existing unpushed commits, and a
  push to `main` triggers the Cloud Run and GitHub Pages deploy workflows.

## Reconcile this stale Downloads checkout against the canonical monorepo
status: blocked
- Blocked on Donald: this is a scope decision, not a routine fix.
- **This checkout (`~/Downloads/files/MLAI-CORPORATION-WWW`) is `ahead 3, behind 166`
  of `origin/main`** as of 2026-09-06 06:50 EDT. It predates the monorepo restructure:
  it has `app/` + `src/` at the root, while `origin/main` has `apps/{web,mobile,quasar}`
  + `packages/`. The canonical checkout `~/dev/active/mlai` is clean at `origin/main`
  (`55a4149`), matching the home map.
- RESOLVED 2026-09-06 06:52: all 3 commits unique to this checkout (`38c3ec6` hero
  signature on mobile, `7152476` hero signature redesign, `442c7bc` design-sync CSS)
  ARE already upstream, landed as PRs #26 and #28 plus the `5b27e94` docs sync.
  `apps/web/src/components/BacktracePanel.tsx` and `apps/web/src/__tests__/
  hero-signature.test.ts` both exist upstream. **This checkout therefore holds zero
  unique history beyond today's two commits, and is disposable** once `csp.test.ts`
  is ported.
- **The CSP fix made in this checkout already exists upstream** at
  `apps/web/next.config.ts`: `if (process.env.NODE_ENV === "development")
  scriptSrc.push("'unsafe-eval'")`, with a comment citing the same crawl noise. Arrived
  at independently and identically, which corroborates the diagnosis but means that
  half of the work has no upstream value.
- **Genuinely novel and worth porting: `src/__tests__/csp.test.ts`.** No upstream test
  references the CSP at all (`grep` over all 26 files in `apps/web/src/__tests__/`), so
  nothing upstream prevents `'unsafe-eval'` from regressing into production. Porting it
  needs upstream's inline `scriptSrc` array extracted into a pure exported function —
  a real change to the deploying app, so it is Donald's call, not a silent edit.
- The crawl hardening does not apply upstream: `link-crawl.py` and `crawl-links.sh`
  do not exist anywhere in the monorepo.
- Nothing was pushed from here. A push would also trigger the Cloud Run and Pages
  deploy workflows.
