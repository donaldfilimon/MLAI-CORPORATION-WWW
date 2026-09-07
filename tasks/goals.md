# Downloads checkout consolidation

This record replaces the stale pre-monorepo checklist imported from
`bdf30b397333b9be3d460a3d2af784d5a00a59f2`. Its original text remains in Git history.

The canonical checkout is `~/dev/active/mlai`. The old Downloads checkout used
root-level web source; this repository keeps web, mobile and Quasar independent.

## Integration decisions (2026-09-06)

- `442c7bc`: design-sync CSS generation and destructive foreground token are
  already present under `apps/web`; the current tests additionally understand
  nullable component mappings and the two-layer export barrel.
- `7152476` and `38c3ec6`: the BacktracePanel and responsive hero guards are
  already present. Preserve the subsequent Quesar copy and hydration fixes.
- `9a0c441`: transfer the dependency upgrades for packages still used by web
  into `apps/web/package.json` and regenerate its independent lockfile. Keep
  `regl`, `@tanstack/react-virtual`, `autoprefixer` and `tsx` removed as decided
  in `d130c97`; preserve monorepo-only dependencies and root orchestration.
- `05ee1ce`: the CSP extraction and all seven original tests already landed
  in `ed1f758`, plus Turnstile and reporting guards. Keep the strict development
  predicate and the complete current allowlist. The retired Python crawler
  is superseded by direct Playwright calls that fail on evaluation/navigation
  errors; do not recreate its external-wrapper dependency.
- `bdf30b3`: preserve the reconciliation history through merge ancestry; this
  updated record describes the canonical topology and disposition.

The generated root sitemap and old root design-sync notes stay retired. Their
canonical app-local counterparts and complete history remain available.

## Validation

The canonical aggregate gate passed before and after integration with Bun
1.4.3: web TypeScript, 270 Vitest tests and Next build; mobile TypeScript, 41
Jest tests, lint and Expo web export; Quasar TypeScript, 60 tests and Expo web
export. The updated web lockfile passed a frozen install, and design-sync CSS
generation passed with the upgraded Tailwind packages. Local validation does
not establish hosted CI or deployment success.

## Port the UX copy pass from the second Downloads checkout
status: done

The "Integration decisions" record above is **correct for the checkout it
describes and stale by one commit for the lineage as a whole.** It reconciles
`~/Downloads/files/MLAI-CORPORATION-WWW`, which ended at `bdf30b3` ("this
checkout is disposable"). A **second** checkout exists at `~/Downloads/files
(1)/MLAI-CORPORATION-WWW`, shares that lineage, and carried on past it.

- Measured 2026-09-06 23:0x, after a `git fetch` (its `origin/main` ref had been
  stale since Aug 8, which made `rev-list` report a misleading `0 behind / 7
  ahead`): that checkout is **1 ahead / 183 behind**. The one commit ahead is
  `5840e4b`, "UX copy pass: the submit button was lying", authored 22:09 that
  day, i.e. *after* the consolidation above was written. It is therefore not
  covered by any bullet in that record.
- Verified by artefact, not by prose: `origin/main:apps/web/src/components/
  InquiryForm.tsx:120` still read `{pending ? "Checking..." : "Check Inquiry
  Details"}` — the exact string `5840e4b` replaces — and none of its new copy
  ("Send inquiry", "two working days", …) appeared anywhere under
  `origin/main:apps/web`. So this is real unlanded work, not a re-port.
- The defect is a promise the UI could not keep: the primary conversion CTA said
  "Check Inquiry Details" on a `type=submit` button that POSTs to
  `/api/inquiries`, so a user could click expecting a preview and instead fire an
  irreversible send. The pass also unifies one action under one name across the
  flow, rewrites inline field errors to say what to do rather than restate the
  constraint, and stops six API routes from rendering our internals and our auth
  vendor's name to end users through `result.error`.
- The commit does not apply here: 183 commits moved under it, including SQLite to
  Postgres. It is being ported by hand across two disjoint file sets (six
  `apps/web/app/api/**` routes; three UI files), which is why this is one slice
  and not two goals.
- `5840e4b` exists on no remote. Bundled to
  `~/at-risk-bundles/mlai-www-files1-uxcopy-20260906.bundle` (re-taken at
  `49ca17f`, verified "records a complete history") before any of this began.

**Current state, stated plainly:** nothing is committed here, the aggregate gate
has not been re-run, and none of this is pushed. The port is in progress in the
working tree only. This section moves to `done` when the copy is landed, the
web gate is green on this machine, and an outcome bullet records what the gate
actually reported — not before.

### Slice log

- **23:1x — API-route copy ported (6 files), `tsc --noEmit` exit 0.** Every string
  from `5840e4b` landed verbatim where the route still existed. Two did not, and
  both are recorded rather than forced: `"Invalid JSON body"` moved into the
  shared `readJsonLimited()` (`src/lib/server/body-limit.ts:115`) and is pinned by
  two assertions in `body-limit.test.ts`, so it is one shared definition serving
  every JSON route, not a per-route string; and `mfa-status`'s `!auth` branch was
  restructured to return `{ ok: true, configured: false }` with no error string at
  all. One string was rewritten that the original pass never saw: the monorepo
  gained a Turnstile check whose `"Human verification failed"` renders verbatim in
  the inquiry dialog, reading as an accusation with no remedy.
- **23:1x — closed the hole that the port would otherwise have left open.**
  `src/lib/server/workos.ts:357` returned `"WorkOS is not configured"` and both
  `inquiries` GET and `telemetry/summary` GET forward it verbatim as
  `access.error`, so the exact vendor name the port removed from two routes still
  reached users by a third path. Changed to match the ported copy. Not pinned by
  any test (`workos-admin.test.ts:28` pins a *different* string, "Administrative
  access is not configured"). **Measured after: 35 files / 322 tests pass.**
- **Deliberately NOT expanded.** `workos.ts` holds 12 further `error:` strings
  forwarded by ~10 route files, three of which still name WorkOS (lines 256, 260,
  317). They are operator- and admin-facing, and rewriting an access-control
  module's whole vocabulary is a different change from porting a copy pass. Left
  as a finding. Same for `"Payload too large"` (`body-limit.ts:82`, 413).
- **Two findings for whoever touches the UI next.** `src/views/Profile.tsx:54`
  hardcodes `'Profile update failed.'` instead of surfacing `result.error`, so the
  new server copy for `PATCH /api/profile` may never reach a user. And the
  telemetry `"Unknown event"` rewrite is cosmetic: `src/lib/telemetry.ts` sends via
  `sendBeacon`/`keepalive` and discards the response, so nobody sees it.
- **Still open:** UI copy (3 files) in flight; `bun run check:web` not yet run;
  nothing committed or pushed.
- **23:2x — `bun run check:web` GREEN, and read from the gate's own exit code
  rather than the wrapper's.** The command was backgrounded as `bun run
  check:web > log 2>&1; echo "EXIT: $?" >> log`, so the harness's "exit code 0"
  describes the `echo`, not the gate — the same class of false green as
  `cmd | tail`. The log's own `EXIT: 0` is the evidence, corroborated by all
  three stages appearing in it: `tsc --noEmit` ran, **35 test files / 322 tests
  passed**, and `next build` compiled and emitted a full route table (so it was
  not an early exit).
- **Still `in_progress`, deliberately: green is not landed.** All nine source
  files are uncommitted in the working tree. The acceptance clause above says
  copy landed AND gate green AND an outcome bullet; two of three hold. Nothing
  is committed and nothing is pushed.
- **DONE 23:2x — the copy is committed to this checkout's `main`, and the word
  "done" here means exactly that and nothing more.** All three acceptance
  conditions hold: the copy landed (9 files + the workos.ts hole), the web gate
  is green (`bun run check:web`, read from the gate's own `EXIT: 0`, with
  `tsc --noEmit`, 35 files / 322 tests, and a completed `next build`), and the
  bullets above record what the gate actually reported.
- **NOT pushed, and that was never in this goal's acceptance clause.** `main`
  here is unprotected (0 rulesets, `protected: false`), and a push triggers CI,
  which gates the Cloud Run and GitHub Pages deploys. That is a separate
  decision and it is Donald's.
- **Two follow-ups this slice deliberately did not take, recorded so they are
  not lost.** (1) The entry-point noun is inconsistent across four files that
  lead into the now-coherent dialog: Home and Navbar say *Request access*,
  `Login.tsx:62` says *Start access request*, `ContactCTA.tsx:48` says *Start an
  Inquiry*. Picking the winning noun is a product call. (2) `Profile.tsx:54`
  hardcodes `'Profile update failed.'` instead of surfacing `result.error`, so
  the new server copy for `PATCH /api/profile` may never reach a user.
- **`workos.ts` still holds 12 further forwarded `error:` strings, three of them
  naming WorkOS (lines 256, 260, 317), plus `"Payload too large"` in
  `body-limit.ts:82`.** Left alone on purpose: they are operator- and
  admin-facing, and rewriting an access-control module's whole vocabulary is a
  different change from porting a copy pass.
