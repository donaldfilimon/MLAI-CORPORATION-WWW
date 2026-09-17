## Consolidate every MLAI tree into this repository

status: done

Captured 2026-09-16 on Donald's request. The destination is the canonical checkout
`~/dev/active/mlai`, chosen over the second checkout
`~/dev/active/MLAI-CORPORATION-WWW`. Consolidation means bringing unique content in
with its provenance recorded. It never means moving or deleting a source. quesar.cloud
stays the GitHub Pages static site. Its Hostinger DNS already points at Pages, and the
live page matched `apps/web/site/index.html` byte for byte, so no DNS change is part of
this goal. The per-tree record is in [`todo.md`](todo.md).

- Outcome, 2026-09-16 13:0x EDT: root `bun run check` exited 0 at `1b09043`
  (tooling 5, web 436, mobile 59 plus export, Quasar 69 plus export, website-app
  137 plus 26 parser tests, research-sites 11). `mlai-website-app` and
  `mlai-research-sites` were merged with their history, the remaining trees were
  preserved under `docs/sources/`, and nothing was moved or deleted. Hosted CI
  and the Pages redeploy stay blocked by the GitHub billing lock.

---

# Current four-app journey delivery — 2026-09-08

The integration at `720b403` is the baseline. All four milestones are implemented
and delivered through `af58896`: Abbey onboarding/source review, public product
discovery, mobile vault recovery, and Quasar connection/preview recovery. Local
gates and five hosted CI jobs passed. Provider-dependent and native/manual
acceptance limits remain explicit. See
[the current delivery ledger](../docs/four-app-journeys.md). Earlier sections are
historical checkpoints, not evidence that this new roadmap is complete.

---

# Current integration completion — 2026-09-08

Canonical checkout: `/Users/donaldfilimon/dev/active/MLAI-CORPORATION-WWW`.
The repository contains the production web app, mobile companion, Quasar, and
`apps/website-app`. The previous consolidation sections below are historical;
read the current integration record before treating their old paths, counts,
or in-progress descriptions as current status.

Status: implementation and bounded local acceptance complete at `3ce1f0c`.
All four app gates, fresh installation, deterministic and cross-browser checks,
local integration/recovery and the live browser repeat passed. Hosted CI passed
all five jobs; Pages published; Cloud Run correctly skipped unconfigured deploy.
The initial live chat model citation error remains an explicit reliability
limitation. Final evidence-only commit delivery is verified in the task closeout.

See [`docs/integration-hardening.md`](../docs/integration-hardening.md) for
current evidence and external boundaries. Existing local installations and
provider configuration remain operator-owned and unchanged.

---

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
- **Not pushed at the time this was written; since pushed.** Verified
  2026-09-07 22:3x: `git merge-base --is-ancestor 87e89e1 origin/main` returns
  true, so the commit is on `origin/main` and CI has run against it. The
  original note stands as a record of the decision boundary at the time -- the
  push was Donald's call, not this goal's -- but the state it describes is no
  longer current.
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

## Finish the copy pass: entry points, swallowed errors, remaining vendor leaks
status: done

Captured 2026-09-06 23:3x. The port goal above closed at `87e89e1` having
deliberately left four findings on the table; this is that work, plus the two
defects the agents found while doing it. One goal, not five, because it is one
intention: make the user-facing copy say what is actually true.

- **Entry-point noun (landed, uncommitted).** Four buttons opening one dialog
  disagreed: Home and Navbar said *Request access*, `Login.tsx:62` *Start access
  request*, `ContactCTA.tsx:48` *Start an Inquiry*. All four now read **"Start an
  inquiry"**. The reasoning is worth keeping, because it inverts the obvious fix:
  the same `openInquiry()` is bound to Footer's Careers, Contact and Press Kit,
  to Services' "Discuss Service", and to every article footer. It is a general
  contact form that emails MLAI and **grants nothing** — so "Request access" was
  over-promising its own destination, and the access-gating language it carried
  already lives in the surrounding copy (Home's `INVITE-ONLY` eyebrow, the
  Navbar's "Invited? Sign in"). "Start an inquiry" was already shipped in
  `article.tsx:220` and `FounderProfile.tsx:279`, so this joins a convention
  rather than inventing one.
- **Swallowed profile errors (landed, uncommitted).** `Profile.tsx:54` hardcoded
  `'Profile update failed.'`, collapsing six distinct failure modes into one.
  The cause was not the obvious one: `updateProfile` goes through `apiJson`,
  which throws `new Error(await res.text())` on any non-2xx, so the handler's
  `{"error":...}` arrives as **raw JSON text in `err.message`** and there is no
  `result.error` to read. The fix parses that, applying the same validity test
  `apiJsonGated` uses so infrastructure noise (a Cloud Run HTML 503) falls to a
  generic fallback instead of rendering as product copy.
- **Remaining vendor leaks (in flight).** `workos.ts` and `body-limit.ts`.
- **Two defects found in passing, NOT fixed, and neither is copy.**
  `ContactCTA.tsx:52` "Schedule a Framework Deep-Dive" is a **dead button** — no
  `onClick`, no `asChild`, no `Link` — rendering full-size beside a working CTA.
  And 413 is **genuinely reachable** on the profile form: the use-case textarea
  has no client-side `maxLength`, and the route's `.slice(0, 240)` runs only
  after the body is read, so a large paste hits the 16 KB cap first.
- **Three follow-ups recorded so they are not rediscovered.** Route
  `updateProfile` through `apiJsonGated` as `createCheckout` already does, which
  deletes the error parsing entirely. `Console.tsx` has four `catch {}` sites
  swallowing errors the same way, two of which assert a specific cause the
  response may contradict. And `Profile.tsx`'s `try` wraps `await refresh()`, so
  a refresh failure after a successful save reports failure — pre-existing, and
  fixing it is a behaviour change rather than a display fix.

Acceptance: all three slices landed, `/simplify` applied to the combined diff,
`check:web` + `check:topology` green read from their own exit codes, committed,
and pushed to `origin/main`. Deploy is CI's to trigger, not this goal's to claim.

### Closed 2026-09-07 22:3x

The work completed at `f08203c` on 2026-09-06 and the status line was never
flipped. Every acceptance condition is now verified rather than assumed:

- **All three slices landed and were committed** as `f08203c`, which is on
  `origin/main` (`merge-base --is-ancestor` returns true). The "landed,
  uncommitted" phrasing throughout the slice logs below is stale -- the same
  commit that wrote those words also landed the code.
- **`/simplify` applied**, recorded in the section below.
- **Gates green, read from their own exit codes.** The missing evidence, run
  2026-09-07 22:3x: `bun run check` (which is `check:topology && check:web &&
  check:mobile && check:quasar`) exits 0 -- topology OK on 8 required paths,
  web at 40 files / 361 tests plus a 104-page `next build`, mobile at 41 tests
  plus an Expo web export, quasar typechecking three workspaces plus its own
  export. Run on `feat/reconcile-vendored-site` @ `1259bde`, which contains
  `f08203c`; the counts are higher than this goal's own 322 because later work
  added tests.
- **The one blocking warning in this goal is resolved.** `Profile.tsx`'s
  `PROFILE_ERROR_COPY` is now keyed on HTTP status numbers, and 413 keeps its
  use-case wording, so the dead `'Payload too large'` key it warned about is
  gone.

Follow-ups recorded in the prose below remain genuinely open and are NOT
covered by this closure: the typed `ApiError` refactor of `apiJson`, the
catch-less `try/finally` blocks in `Console.tsx`, the missing client-side
`maxLength` on the use-case textarea, and the callerless `getInquiries`.

### Slice log — vendor leaks (landed 23:3x, uncommitted)

- **Six strings in `workos.ts`, two in `body-limit.ts`, three test assertions.**
  `bunx vitest run` from `apps/web`: exit 0, 35 files / 322 tests.
- **⚠️ MUST RECONCILE BEFORE COMMIT: `Profile.tsx`'s `PROFILE_ERROR_COPY` key
  `'Payload too large'` is now dead.** `body-limit.ts:62` no longer returns that
  string, so the map falls through to `PROFILE_ERROR_COPY[apiError] || apiError`
  and renders the new generic copy. Nothing crashes and nothing leaks — the
  fallback is by design — but Profile silently loses its use-case-specific
  wording ("Shorten the use case"), and the doc comment at `Profile.tsx:19-21`
  now names two strings that no longer exist. This is exactly the class of defect
  that survives a green gate: no test covers it and the failure is graceful.
- **My brief for that agent was wrong on a load-bearing point, and it said so
  rather than following it.** I framed `workos.ts` as admin/operator-facing and
  told it to weigh precision over plainness. That holds for `checkAdminAccess`,
  but `checkOrganizationAccess` errors are forwarded as `access.error` by
  `/api/llm/chat`, `/api/llm/status`, `/api/consent`, `/api/audits` and
  `/api/audits/[id]` — ordinary beta-user routes — and `Console.tsx:235` renders
  them in a `role="alert"` banner. The earlier pass had already rewritten one
  string in that same function (line 357), leaving three siblings in internal
  voice on the same code path. Widening to six was correct; my instruction was
  not. Recorded because the next person to write such a brief will make the same
  mistake: *"which function is it in"* does not tell you who reads the string —
  *"which routes forward it"* does.
- **It also found a third pinned assertion my brief missed** (`body-limit.test.ts`
  line 79, `payloadTooLarge()` direct), beyond the two I named at 101 and 128 —
  where 128 sits inside a `describe.each` serving six cases.
- **Six `workos.ts` strings deliberately left**, each naming a distinct condition
  with a distinct remedy: `ADMIN_EMAILS` unset vs. not-on-the-allowlist; IdP
  attestation missing vs. MFA policy unconfirmed vs. MFA not enrolled vs. factor
  lookup transiently failing; impersonated/unknown session kind. Four are pinned
  by `workos-admin.test.ts`, which is evidence they are vocabulary rather than
  drift. Collapsing the MFA rows would invert the remedy in both directions.

### Slice log — the dead CTA (landed 23:3x, uncommitted, PRODUCT-VISIBLE)

- **`ContactCTA.tsx`'s "Schedule a Framework Deep-Dive" button was removed, not
  wired — and the evidence says it was never wired in the first place.**
  `git log --follow` traced it to its introduction in `bf43f25` ("feat:
  modernize MLAI web platform"); the markup is **byte-identical across all 8
  historical revisions**. It was born inert, not broken by a later refactor.
- **Inertness was proven, not inferred.** No `onClick`, `asChild`, `Link`,
  `href`, `form` or `formAction` on the button; `Magnetic` renders `{children}`
  inside an `m.div` carrying only mouse handlers and never `cloneElement`s; the
  `Button` primitive with `asChild` false forwards only variant/size/className;
  and there is no `<form>` anywhere in the ancestor chain (`About.tsx` is the
  sole consumer), so `type="submit"` could not have fired either.
- **No destination exists to wire it to.** All 31 `page.tsx` files under
  `apps/web/app/`: no `/schedule`, `/book`, `/contact`, or `/consultation`.
  A grep for `calendly|cal\.com|savvycal|hubspot|meetings\.|book.*(call|demo)`
  across `apps/web` returns **zero hits**.
- **It deliberately refused two available redirects, and the reasoning is the
  whole point of this goal.** Pointing it at `/showcase/explainer` (a
  prerecorded video) or `/demo` (an in-browser WDBX miniature) — or at
  `openInquiry()` like its sibling — would have made the button *do something*
  while still lying: "Schedule a Framework Deep-Dive" promises a booked session
  with a person. That is the same defect class as the "Check Inquiry Details"
  button this goal started with. The section now shows one working CTA instead
  of one working and one lying.
- **⚠️ This is the only user-visible REMOVAL in the whole pass** — everything
  else is wording. A button disappears from the About page. It is the right call
  on the evidence, but it is a product decision and Donald can veto it; every
  other change in this goal stands independently of it.
- `bunx tsc --noEmit` exit 0. No test referenced `ContactCTA` or either string
  (the lone `scheduler-auth.test.ts` grep hit is a false positive — GCP audit
  scheduler OIDC, matched on the word "Schedule").

### Slice log — Console error handling (landed 23:3x, uncommitted)

- **Five sites fixed, not the four I scoped.** The fifth is the worst of them:
  the initial `Promise.all(...).catch` set `cause.message` **raw**, so a user
  outside the beta org was shown the literal string
  `{"error":"Your account isn't in the Quesar beta yet. …"}` — JSON braces and
  all — on screen. Nobody knew that was there.
- **Guessed causes deleted, and this is the substance of the change.** `viewAudit`
  asserted "requires MFA and a reason of at least 8 characters" for *any* admin
  read failure, including 404, invalid-id, and a decryption 503.
  `loadAdminAudits` enumerated four causes regardless of which fired.
  `handleSubmit` asserted the audit write was the failure point, when that 503
  wraps generation *and* persistence and does not say which. Two real conditions
  were previously invisible: a 429 rate limit, and a 428 consent-required.
- **Three defects reported and deliberately not fixed:** `withdrawPolicy`,
  `exportAudit` and `removeAudit` have `try/finally` with **no catch**, so
  failures become unhandled rejections and the user sees nothing at all — a
  different defect class from the one scoped. `profileErrorMessage` and
  `consoleErrorMessage` are now near-identical and want hoisting once the
  `api.ts` work lands. And every Console call uses `apiJson`, none uses
  `apiJsonGated`, so the HTTP status is unrecoverable and copy can only be keyed
  on the message text.

### ⚠️ NOT a leak: "WorkOS" and "AuthKit" in non-error copy. Do not "fix" this.

The Console agent flagged `Console.tsx:271/284/294` as vendor names the removal
pass missed. **Checked before acting, and it is a false positive.** The name
appears deliberately across the whole product surface — `Home.tsx:13,29,115,164`,
`Login.tsx:45,62,65`, `Docs.tsx:229-231,244-249,429,614`, `Hero.tsx:16,27`, and
`Privacy.tsx:19,28,30`.

The distinction that matters, stated once so it is not relitigated: a vendor name
**inside an error message** is a leak, because someone hitting an error has no
idea what WorkOS is and cannot act on it. A vendor name in **architecture, trust,
or privacy copy** is a deliberate claim — for a security-positioned product,
naming the identity provider is the point, and `Privacy.tsx` naming it as a
sub-processor is plausibly a legal obligation. Removing these would have degraded
product copy and possibly a privacy disclosure.

Separate and still open, as a product question rather than a defect: the login
button reads **"Continue with AuthKit"**, which names our vendor's product to a
user deciding whether to click. That is a branding call, not a leak, and it is
Donald's.

### /simplify — 4 review agents, applied 23:4x

**Applied (4):** the `api.ts` docblock paragraph asserting history that never
happened (it claimed `Profile` "had to `JSON.parse(err.message)`", but at HEAD
that catch was a single fixed string — it described an uncommitted intermediate
state); the stale "out of scope here" memo in `Console.tsx`, replaced with the
actual decision and a warning not to add status-dependent copy there because it
cannot be expressed; a double type-assertion tidied to match what
`apiJsonGated` already does; and `ContactCTA`'s wrapper, where removing the
second child left `flex-col sm:flex-row` and `gap-4` dead — including a
responsive variant that can never fire (`flex justify-center` renders
identically). Also fixed a divergence this diff *introduced*: `workos.ts:370`
and `Login.tsx:24` had two different sentences for the same refusal reached by
two paths; `Login.tsx` now uses the `workos.ts` wording.

**REJECTED, and this is the one worth keeping.** The simplification agent said
to delete `CONSOLE_ERROR_COPY["Protected generation failed"]` because it is
"byte-identical to its own call-site fallback" and "whether the body parses or
not, the user sees the same sentence." **That reading of the mechanism is
wrong.** `consoleErrorMessage` ends
`if (!apiError) return fallback; return CONSOLE_ERROR_COPY[apiError] || apiError;`
— the fallback is reached only when parsing *fails*. When the handler's body
parses, a missing row falls through to `apiError`, i.e. the raw internal string.
Deleting that row would have shown users **"Protected generation failed"**
verbatim. The row is load-bearing. `"Invalid audit id"` was kept on the same
asymmetry: deleting a dead row saves one line, and being wrong about
reachability shows internal copy.

**DEFERRED — the root cause, specified so it is not re-derived.** Three of four
agents flagged that this diff solves one problem two ways: `Profile` keys copy
on the HTTP **status**, `Console` on the handler's **prose**. The altitude agent
found the real cause is neither view — it is `apiJson` doing
`throw new Error(await res.text())`, which discards the status and stringifies
the body, so `Console` re-parses what `apiJson` just serialized. The fix is to
make `apiJson` throw a typed `ApiError { status, error, body, structured }`,
after which `apiJsonGated` collapses into a thin wrapper over it and
`consoleErrorMessage` becomes one line.

Blast radius was **measured, not estimated**: `apiJson` is module-private with
14 wrappers whose signatures are unchanged (`Promise<T>` before and after); the
only behavioural change is the content of `err.message`, and every site reading
it was grepped — `Console.tsx` (shrinks), `Profile.tsx:55-59` (reads
`.value` only), two bare `catch {}`, and one assertion in `api.test.ts:20`.
**≈3 files and one test assertion — smaller than the two workarounds this diff
shipped combined.**

**Not done now, deliberately.** It is shared-infrastructure surgery, and
bundling it into the same push as a copy pass would mean that if the deploy
misbehaves, nobody can tell which half caused it. The shallow alternative
(migrating Console's 5 calls to gated wrappers) was also rejected: it would add
7 wrappers that the deeper fix then deletes. Ship the copy pass; do this as its
own change. Free deletion when it happens: `getInquiries` (`api.ts:137`) has
zero callers.

## Close the deferred API and account UX follow-ups
status: done

Closed 2026-09-08 in `165e591`, pushed directly to `origin/main` as a separate
change from the copy pass:

- `apiJson` now throws a typed `ApiError` carrying status, parsed body, error
  text, and the structured-body distinction. `apiJsonGated` shares that decoder,
  and Console no longer reparses JSON serialized into `Error.message`.
- Consent withdrawal, audit export, and audit deletion now surface structured
  route errors or safe infrastructure fallbacks instead of rejecting silently.
- The profile use-case field enforces the route's 240-character limit. A
  successful save followed by a failed session refresh is reported as a saved
  profile that needs a page refresh, not as a failed save.
- The primary login actions now say **Sign in to Quesar**. WorkOS and AuthKit
  remain named in the architecture, trust, security, and privacy copy where the
  provider disclosure is intentional.
- The callerless `getInquiries` wrapper and its private response type were
  removed.

TDD evidence: the focused API and server-rendered product-form suite passed 19
tests after each new assertion first failed against the old behavior. Hosted CI
run `34198095485` passed topology, web, mobile, and Quasar on the exact commit;
web reported 41 files / 365 tests and a successful Next production build. Pages
run `34198221383` then published successfully, and `https://quesar.cloud/`
returned HTTP 200 with the new publish timestamp.

Provider boundaries are unchanged: Cloud Run run `34198221398` completed only
its readiness check and skipped the deploy job because the required production
WIF/project variables are absent. The orphaned Vercel `mlai-web` project still
requires authorized dashboard access and a separately confirmed destructive
deletion; neither provider gap is a repository-code failure.

## Make invalid dynamic routes and in-page anchors behave correctly
status: done

Captured retroactively 2026-09-08 04:3x. The work landed as `abbf485`
("fix(web): handle invalid dynamic routes and hash navigation", 12 files,
+368/-67) with a bare one-line commit message and no ledger section, so this
records what it actually did and the evidence that it holds. Verified by
artefact rather than by prose: `git show --stat`, the diffs named below, and a
full local gate run, not the commit subject.

- **Six dynamic-slug families now refuse unknown slugs instead of rendering a
  half-page.** `blog`, `docs`, `products`, `projects`, `research`, and `team`
  each gained `export const dynamicParams = false` plus a
  `generateStaticParams()` over the in-repo content, and their `page.tsx` now
  calls `notFound()` when the slug misses. Previously the JSON-LD block was
  conditionally skipped for a missing record while the view still rendered, so
  an unknown slug produced a page rather than a 404.
- **The measurable consequence:** `next build` now emits **143 static pages**,
  up from the 104 recorded in this ledger's previous closure, because every
  slug in the six families is prerendered rather than resolved at request time.
  The sitemap is unchanged in kind (69 URLs, `llms.txt` 56 links).
- **`NotFound.tsx` became section-aware.** A `SECTION_RECOVERY` map gives each
  family its own eyebrow, title, body, and back-link ("All documentation",
  "All notes", "Research archive", "All products", and so on) instead of one
  generic 404, so the recovery path leads back into the section the user was
  already in.
- **`ScrollToTop` no longer destroys in-page anchors.** It reset scroll to the
  top on every pathname change, including navigations carrying a `#fragment`.
  It now scrolls to the fragment's element and, because App Router can publish
  the new pathname before the route's client content mounts, retries across up
  to 120 animation frames before giving up, cancelling the frame on cleanup.
- **The link crawler gained a third phase that can actually catch this.**
  `crawl-links.mjs` collects cross-route `href#fragment` links, then clicks each
  one and verifies the target element's rendered position, because `norm()`
  deliberately strips hashes for route discovery and a URL-only check cannot
  tell whether the destination section ended up below the viewport.
- **Two new suites pin the behaviour:** `dynamic-route-not-found.test.tsx` and
  `not-found-recovery.test.tsx`.

**Verification, read from the gate's own exit code and not from a wrapper.**
`bun run check` was run at `c710619` (the current `origin/main` tip, which
contains `abbf485`) redirected to a log with `echo "EXIT: $?"` appended; the
log's own **`EXIT: 0`** is the evidence, corroborated by every stage appearing
in it rather than an early exit:

- topology: `MLAI topology OK (8 required paths)`
- web: `tsc --noEmit`, **43 test files / 391 tests passed**, sitemap 69 URLs
  and `llms.txt` 56 links, `next build` compiled and generated 143 pages
- mobile: **7 suites / 41 tests passed**, `expo lint`, `Exported: dist`
- quasar: three workspaces typecheck at exit 0, **60 pass / 0 fail / 160
  expect() calls across 10 files**, `Exported: dist`

Hosted CI agrees on the same commit: run `34204092610` reports topology, web,
mobile, and quasar all `success`, and Pages run `34204233040` published.

**Still open and unchanged by this work, re-measured rather than restated.**
Cloud Run run `34204233028` on `c710619` shows `readiness: success` but
`deploy: skipped`, so the provider gap recorded in the previous goal's closure
holds: the deploy job is still gated on production WIF/project variables that
are absent. That is a credentials decision, not a repository-code failure, and
nothing in this goal touched it.

## Give the root CLAUDE.md the cross-app facts an agent cannot get from one file
status: done

Closed 2026-09-08. Merged as **PR #69** (`5934a2d`, one file, +56/-0), now in
`main` at the merge commit `c710619`.

- The root `CLAUDE.md` was a routing index only, so a fresh agent had to open
  `AGENTS.md` for the orchestration commands and could not learn the cross-app
  invariants from any single file. Added a **Root commands** block (the six
  scripts the root actually owns, linking to `AGENTS.md` *Gate boundaries*
  rather than copying per-app detail, per this repo's own rule) and a
  **Cross-app facts** section holding five things that each take several files
  to reconstruct.
- Those five: the test runner differs per app and a bare `bun test` silently
  runs the wrong runner in web and mobile while being correct in quasar;
  `check-topology.ts` lists root `CLAUDE.md` among its required paths, so
  renaming this file fails the first gate in `bun run check`;
  `@mlai/contracts` reaches web and mobile only as `import type` while
  `@mlai/design-tokens` is imported by no app source at all; CI installs
  `--frozen-lockfile` per app while `install:all` is non-frozen, so lockfile
  drift surfaces in CI and not locally; and `apps/web/site/` is a separately
  published Pages artifact whose duplicated brand assets the `public/`
  regeneration script does not touch.
- Each claim was verified against source before it was written: the package
  manifests for the runners, `check-topology.ts` for the required paths, a
  `grep` across `apps/` for the `@mlai/*` import sites, `ci.yml` for the frozen
  installs, and a directory listing for the duplicated `site/` assets. Nothing
  in the existing file was stale, so the change is purely additive and no
  pointer was rewritten.
- Merged with all four CI checks green. Per the machine git policy the topic
  branch was merged back and then deleted both locally and on `origin`, so this
  checkout is on `main`, clean, and in sync.

## Close the hosted provider gaps (Cloud Run cutover, orphaned Vercel project)
status: blocked

Captured 2026-09-08 04:3x. These two residuals were recorded as prose inside a
closed goal, which is where an open item goes to be forgotten. They are one
intention (finish the hosted provider state) and neither is a repository-code
defect, so this section exists to keep them visible rather than to be worked.

**Blocked on Donald, not on code. Nothing here is actionable by an agent:**
provisioning deployment credentials and deleting a hosting project are
authorization decisions, and the second is destructive.

### Cloud Run deploy has never run, and the reason is measured

- `deploy-cloudrun.yml` gates its `deploy` job behind a `readiness` job that
  checks exactly two values, `vars.WIF_PROVIDER` and `vars.GCP_PROJECT_ID`.
  When either is empty it emits a notice and sets `ready=false`, so the run
  reports `success` while the deploy is skipped. Reading only the run
  conclusion therefore says "deployed" when nothing deployed. On `c710619`,
  run `34204233028` shows `readiness: success` and `deploy: skipped`.
- **Checked at all three scopes, because a repository-only check would have
  been a false negative:** the `production` environment exists and holds zero
  variables and zero secrets, repository scope holds zero of each, and
  `donaldfilimon` is a user account rather than an organization, so no
  org-level scope exists (the API 404 there is expected, not missing data).
- The workflow references **25 distinct `vars.*`** in total (project, region,
  service, artifact repository, both service accounts, Cloud SQL connection and
  database identity, the WorkOS organization and its two MFA policy flags, the
  Cloudflare AI Gateway pair, Turnstile site key and hostnames, and the three
  audit KMS/scheduler values). The two gate variables unblock the job; the rest
  are what it needs to succeed once it runs.
- The soft-skip is deliberate and documented in the workflow's own comment: it
  avoids a red `google-github-actions/auth` on every push to `main` without
  applying OpenTofu or touching Hostinger NS or Cloudflare. Do not "fix" the
  red-free state by removing the gate.

### Orphaned Vercel `mlai-web` project

Carried forward from the previous goal's closure and **not independently
verified in this session** (it needs authorized Vercel dashboard access, which
this session does not have). Recorded as stated there: the project still
requires an authorized dashboard session and a separately confirmed destructive
deletion. Re-measure before acting on it.

### What is not blocked

Everything in the repository itself is green and pushed. `bun run check` at
`c710619` exits 0 across all four gates, hosted CI run `34204092610` agrees,
and Pages run `34204233040` published. GitHub Pages is the surface that is
actually live; Cloud Run is the one that has never cut over.

### Re-measured 2026-09-08 18:3x — the green-gate evidence above was 89 commits stale

Appended rather than edited, because this section is append-ordered and the
older text is still an accurate record of what was true when it was written.

- **What was stale.** "What is not blocked" cites `bun run check` exiting 0 at
  `c710619`. That commit is an ancestor of HEAD but sits **89 commits and 373
  files** behind it (`git rev-list --count c710619..HEAD`). Read as current
  evidence it overstates its own freshness. The newer top-of-file sections,
  which claim gates green through `af58896`, were the accurate ones.
- **What was measured.** `bun run check:web` at HEAD `cf8cefd` exits **0** —
  `tsc --noEmit`, the Vitest suite, and a `next build` that emitted a full
  route table. This corroborates the `af58896` claim one commit further along.
- **How, so the method can be checked rather than trusted.** Run in this
  checkout, which was verified clean, `0` ahead / `0` behind `origin/main`, and
  unowned (no process cwd'd here; `.git/index` last written 09:55). The exit
  code was read from the log's own `===CHECK_WEB_EXIT=0===` marker, not from a
  wrapper's status and not through a pipe — per the `cmd | tail` trap recorded
  in `~/CLAUDE.md`, a trailing command's status silently replaces the gate's.
- **This does NOT unblock the goal.** Cloud Run still has zero of its two gate
  variables at every scope, and the orphaned Vercel project still needs an
  authorized dashboard session plus a confirmed destructive deletion. Both
  remain authorization decisions for Donald. `status:` stays `blocked`.
- **Unrelated hazard found while measuring, recorded here only because it would
  otherwise be lost.** The sibling checkout `~/dev/active/mlai` has
  `apps/web/.design-sync/NOTES.md` **staged by a third party** (verified with
  `git --no-optional-locks diff --cached --name-only`). A bare `git commit`
  there would sweep in another session's work. Not a defect in this repository
  and not part of this goal.

### Blocking conditions re-measured 2026-09-08 18:4x — still blocked, now verified at HEAD

Re-measured rather than re-asserted, because the block is a factual condition
that could have changed since it was captured at 04:3x.

- **Both gate variables are still absent, checked at every scope that exists.**
  Repository scope holds `0` variables. The `production` environment holds `0`
  variables and `0` secrets. Two environments exist (`github-pages`,
  `production`). So `vars.WIF_PROVIDER` and `vars.GCP_PROJECT_ID` are still
  unset and the `deploy` job still cannot run.
- **The misleading-green pattern is confirmed at HEAD, not just at `c710619`.**
  On `cf8cefd`, run `34235087682` ("Deploy to Cloud Run") reports the run
  conclusion **success** while its jobs read `readiness: success` /
  `deploy: skipped`. Reading the run conclusion alone still says "deployed"
  when nothing deployed. Check the job breakdown, never the run badge.
- **Hosted CI is genuinely green at HEAD.** Run `34234922098` on `cf8cefd`
  passes all five jobs (`topology`, `web`, `mobile`, `quasar`, `website-app`),
  and Pages run `34235087719` succeeded. This corroborates the local
  `check:web` result recorded above, from an independent runner.
- **Unchanged and still Donald's call.** Setting the two variables is an
  authorization decision; the orphaned Vercel `mlai-web` project still needs an
  authorized dashboard session and a separately confirmed destructive deletion,
  and was again not verified here for that reason. `status:` stays `blocked`.

### ⚠️ 2026-09-08 23:0x — hosted CI stopped running entirely; the green above is now historical

The `af58896`/`cf8cefd` CI evidence recorded above was accurate when measured
and is left standing. **It no longer describes the current state**, and anyone
reading this file for "is CI green" must read this entry too.

- **Every job is rejected before it executes.** On `3ed1f2c`, run `34288578444`
  failed in **4 seconds** (`22:59:40Z` → `22:59:44Z`). All five CI jobs plus
  Cloud Run's `readiness` job report `failure` with **zero steps executed**, no
  runner assigned (`runner: ""`), and null output. `readiness` merely reads two
  `vars` and had succeeded on `cf8cefd`, so this is not a test or a code fault.
- **The trigger was a docs-only commit**, touching just `tasks/goals.md`. No
  source, config, workflow or dependency changed, which rules out the change
  itself as the cause.
- **It is not a workflow permission setting.** `repos/.../actions/permissions`
  reports `enabled: true`, `allowed_actions: all`.
- **Window:** the last fully green runs were at `13:5xZ` on `cf8cefd`. A
  scheduled run in `donaldfilimon/abi` still succeeded at `20:26Z`. So the
  change happened between `20:26Z` and `22:59Z` today.
- **Cannot be diagnosed further from here, and this is the honest limit.** The
  billing endpoint needs the `user` OAuth scope, which this session does not
  hold; acquiring it means changing auth scope, which is Donald's decision, not
  an agent's. The signature (instant rejection, no runner, account-wide) most
  commonly means an Actions spending limit or a payment problem. **Verify on
  the GitHub billing page before believing that guess.**
- **Consequence for this ledger:** "verify" in any land/push/verify goal cannot
  currently be satisfied by hosted CI for this repository. Local gates still
  can — `bun run check:web` passed locally at `cf8cefd`.

### Open Dependabot alert, surfaced by the push and unrelated to CI

- Alert 5, **moderate**, still `open`: `accelerate` path traversal and denial of
  service via sharded checkpoint `weight_map` entries, in
  `apps/website-app/worker/uv.lock`, vulnerable range `<= 1.14.0`.
- **There is no fixed version yet** (`first_patched_version: null`), so this
  cannot be closed by bumping and is not an oversight. Recorded so it is not
  rediscovered as new.

### 2026-09-16 — the CI outage cause is now CONFIRMED, not inferred

The 2026-09-08 entry above stopped at "most commonly means a spending limit or
payment problem" and said to confirm before believing it. Confirmed now, and the
guess was right for the right reason. Recorded so nobody re-derives it.

- **The annotation says it outright:** `The job was not started because your
  account is locked due to a billing issue.` Read with
  `gh api repos/<owner>/<repo>/check-runs/<job id>/annotations --jq '.[].message'`.
- **That is the method the earlier entry lacked.** `gh run view --log-failed`
  returns `log not found`, which is **not evidence of anything** — the jobs never
  ran, so no log exists. Do not read that as a missing-log defect.
- **Still locked**, verified on run `35051297357` at `304cf28`, eight days after
  the first refusal. Scope is account-wide across `donaldfilimon/*`, not this
  repository, and **self-hosted runners are unaffected**.
- **Treat every red hosted check dated after 2026-09-08 20:26Z as UNMEASURED,
  never as a failing gate, and never change code to satisfy one.** The local
  gate remains the usable signal: `bun run check:web` passed at `cf8cefd`.
- Clearing it is Donald's, in GitHub billing settings. The `gh` billing endpoint
  needs the `user` OAuth scope this token lacks, so an agent cannot confirm the
  balance itself — only the annotation.


### 2026-09-16 13:1x EDT — Donald chose the full cutover; blocked on billing before anything was created

Donald's decisions this session: go ahead with the **full Cloud Run cutover**, host it in a
**new `quesar-prod` GCP project**, and **reconnect the Vercel connector** so the orphan can
be verified. Measured before acting:

- **Hard stop: every GCP billing account on `cbkshadow@gmail.com` is closed.**
  `gcloud billing accounts list` shows four accounts (`My Billing Account`,
  `My Billing Account 1`, `My Billing Account 2`, `Main`), all `OPEN False`. The
  OpenTofu root needs a billed project (regional-HA Cloud SQL `db-custom-2-7680`,
  global HTTPS load balancer, KMS, Scheduler, Artifact Registry). So
  `quesar-prod` was **not** created: an unbilled project would be one more orphan.
  Reopening a billing account or adding a payment method is Donald's.
- **Ready once billing is open:** `gcloud` is authenticated as `cbkshadow@gmail.com`,
  application-default credentials exist (2026-09-03), `tofu` is installed, and no
  GCP organization exists (personal account). The ID `quesar-prod` could not be
  checked for availability; `describe` returns the same permission error whether a
  project is foreign or absent.
- **Still zero deploy variables and secrets** at repository scope and in both
  environments (`github-pages`, `production`).
- **The cutover moves quesar.cloud off GitHub Pages.** `edge.tf`'s Cloud Armor policy
  admits only Cloudflare proxy ranges, so the apex must be proxied through
  Cloudflare, and the nameservers move from Hostinger's `dns-parking.com`. The iCloud
  MX, SPF and `apple-domain` records must be recreated there first, or mail breaks.
  No Cloudflare CLI or credentials are on this machine.
- **Credentials only Donald can supply:** `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`,
  `WORKOS_ORGANIZATION_ID`, the Cloudflare AI Gateway URL, ID and token, the Turnstile
  site key and secret, and `ADMIN_EMAILS`. `SESSION_SECRET` and `AUDIT_SUBJECT_PEPPER`
  can be generated locally and piped straight to `gcloud secrets versions add`.
- **Even when fully configured, the deploy cannot run** until the GitHub Actions billing
  lock (above) is cleared.
- **Vercel `mlai-web`: still unverified.** The connector is signed in but
  `list_teams` returns `[]` and `get_project mlai-web` returns 403. The default URL
  `https://mlai-web.vercel.app` answers `x-vercel-error: DEPLOYMENT_NOT_FOUND`,
  which means no deployment is served there. It does not prove the project was
  deleted. Next step: Donald reconnects the connector with access to the owning
  account; then verify, pause (reversible), and Donald deletes.

**Execution order once unblocked:**
1. Open a billing account.
2. `gcloud projects create quesar-prod`, then link billing.
3. Create the versioned state bucket.
4. `tofu init` / `plan`, with the plan reviewed before `apply`.
5. Load the secret versions.
6. Set the GitHub variables from `tofu output -json runtime_configuration`.
7. Cloudflare zone with the mail records copied, then the nameserver change at
   Hostinger.
8. Clear the Actions billing lock.
9. Run the deploy, then check the job breakdown rather than the run badge.

`status:` stays `blocked`.

- **Re-measured 2026-09-16 13:5x EDT, after the consolidation and trailer slices
  landed:** all four GCP billing accounts still read `OPEN False`; the hosted
  Actions annotation still says the account is locked for billing (read on the
  latest run); the Vercel connector still returns no teams and a 403 for
  `mlai-web`. To let an agent verify and pause that project, reconnect the
  Vercel connector in claude.ai connector settings with the account or team
  that owns `mlai-web`; deletion stays a dashboard action. Nothing in this
  goal moved. `status:` stays `blocked`.
- **Re-measured 2026-09-16 14:3x EDT:** billing accounts 4 of 4 still
  `OPEN False`; nothing else moved. `status:` stays `blocked`.

### Re-measured 2026-09-16 20:1x EDT — the billing lock still holds

- Push `a04abe6` (docs only) triggered CI run `35165891132` and Cloud Run run
  `35165898375` at 2026-09-17 00:16Z. All eight jobs (topology, web, mobile,
  quasar, website-app, research-sites, readiness, deploy) show zero steps and no
  runner, and the check-run annotation reads "The job was not started because
  your account is locked due to a billing issue." So the red CI on `a04abe6`
  is the lock, not the code; `check:topology` passed locally on that commit.
- Nothing about this goal is agent-actionable until the lock is cleared.

## Productionize the MLAI & Abbey cinematic trailer
status: done
opened: 2026-09-08 16:5x EDT

- Outcome, 2026-09-16 14:3x EDT: acceptance met. The scene grammar ships on the
  extracted `@mlai/trailer-engine` core as `/showcase/abbey` (seven cues,
  narration, transcript, visual reduced motion, frame-time adaptive quality);
  the latency copy was resolved by dropping the number; and the root
  `bun run check` exited 0 on a reconciled main at 14:29 with
  `NEXT_DIST_DIR=.next-gate` (tooling 5, web 465, mobile 59, Quasar 69,
  website-app 137 + 26 parser, research-sites 11), then again typechecked
  after `a31e78c`. Residuals, stated plainly: nobody has listened to the
  narration, nobody has run VoiceOver over the transcript, caption and slider,
  and Donald has not yet reviewed the seven frames.

Donald passed a deep-research report proposing that a single-file HTML/CSS/JS
"MLAI & Abbey" cinematic trailer prototype be rebuilt as a production
framework-agnostic engine in a new `mlai-abbey-trailer/` root. Plan approved at
`~/.claude/plans/virtual-prancing-turtle.md`, full scope (four phases).

**The report's premise was wrong in the same way the 2026-09-07 stack-audit
report's was, and this is the second instance of one pattern.** That goal (home
ledger, "MLAI marketing/docs site — 2026 stack audit report") is blocked because
its report concluded "greenfield build" against a repo that already exists. This
report likewise proposes building a `ParticleSystem`, `TimelineEngine`,
`AudioEngine` and `SceneManager` from scratch, while `apps/web/src/film/` already
holds 4,196 lines of exactly that, live at `/showcase/film` and
`/showcase/trailer`. **Externally-authored reports about this codebase have now
twice recommended greenfield against existing code. Verify the premise against
disk before acting on the next one.**

Two further premise corrections, both measured rather than argued:

- **The prototype file is not on this machine.** Searched `~/dev/active`,
  `~/Desktop`, `~/Downloads` (incl. `files/` and `files (1)/`), `~/tmp`,
  `~/Archive`, `~/Public` for `scriptTimeline`, `renderCanvas`, `highlight-abi`,
  `110ms LATENCY`, `Lissajous` — zero hits. The report was written against code
  supplied in conversation. **Its twelve defects are therefore design hazards to
  test against, not located bugs**, and nothing here claims that file was read.
- **Four of those twelve were already solved in `film/`**, verified by reading
  it: frame-rate-independent `dt` (`engine.tsx:140`), `devicePixelRatio` capped
  at 2 (8 call sites), no `innerHTML` anywhere in `film/` or `trailer/`, and an
  EQ/compressor bus already on the audio graph.

### Slice 1 — Phase 1 correctness

- **The clock defect was more precise than the report described, and the report
  would have missed it.** `engine.tsx:140` already derived `dt` from the rAF
  timestamp correctly. What was absent was a clamp: rAF stops in a backgrounded
  tab while `lastTsRef` retains the pre-suspension timestamp, so the first frame
  back advanced the playhead by the entire time away — two minutes off-tab ran
  the whole trailer out. Now `frameDelta()` / `MAX_FRAME_DT`.
- **`visibilitychange` pauses on tab-hide** (`engine.tsx`). `narration.tsx:177`
  already mirrors `playing` to `NeuralVoice`, so clearing that one flag pauses
  clock and voice together. Deliberately does **not** auto-resume.
  **PRODUCT-VISIBLE on two live routes:** tabbing away from `/showcase/film` or
  `/showcase/trailer` now returns to a paused player. Donald's to veto.
- **`neural-voice.ts` `pause()` captures its `AudioContext` instance** instead of
  re-reading mutable `state.ctx!` inside a 100 ms timer.
- Regression test `apps/web/src/__tests__/film-clock.test.ts`; mutating the clamp
  out fails 3 of its 5 assertions.

### Resolved from repo evidence, not by asking

The plan claimed three conflicting persona->color mappings. **That was
overstated and the plan file has been corrected.**
`apps/web/docs/master-reference.md:170-176` states the shipped mapping —
**Abbey emerald, Aviva violet, Abi cyan** — and `film/tokens.ts` `PERSONAS`
matches it exactly. The apparent third mapping is `packages/design-tokens`
`productColor`, keyed by `ProductAccent`: **products, not personas.** Only the
report's mapping (amber=Abi, cyan=Aviva, violet=Abbey) is wrong, on all three,
and MLAI has no amber persona at all.

**Trap to carry forward:** `productColor.abi` is violet while `PERSONAS.abi` is
cyan. New scenes must reach for `PERSONAS`.

Contrast, computed directly rather than taken from the report: every MLAI token
passes WCAG AA at both thresholds (violet `#A855F7` 5.18:1). The prototype's
violet `#B400FF` is the only failing color at 4.25:1.

### Slice 2 — Phase 2 mechanism proven

**Chosen to answer one unknown before 4,196 lines depend on it, and the unknown
was real.** No runtime value had ever crossed a package boundary in this repo:
`@mlai/contracts` is imported type-only, exactly once
(`apps/web/src/components/site/accent.ts:17`), and a type import never reaches
the bundler; `@mlai/design-tokens` has **zero consumers**; `next.config.ts` sets
no `transpilePackages`.

- Created `packages/trailer-engine` (`@mlai/trailer-engine`) carrying
  `src/clock.ts` — `MAX_FRAME_DT` and `frameDelta`.
- Wired the full mechanism: `file:` dep in `apps/web/package.json` matching the
  `@mlai/contracts` form, added to `check-topology.ts`'s hardcoded list
  (topology now reports **9** required paths, was 8), `bun install` exit 0.
- **PROVEN, not inferred.** The emitted client chunk contains
  `let r=1/15,a=(e,t)=>Math.min(Math.max(0,(e-t)/1e3),r)`. The value crossed the
  boundary, was transpiled from raw `.ts`, and reached the browser bundle **with
  no `transpilePackages`**. A green compile alone would not have shown this.
- **Re-verified against `origin/main` 2026-09-08 18:3x:** `packages/` there is
  still exactly `contracts`, `design-tokens`, `tooling`, and `next.config.ts`
  still has no `transpilePackages` — so this finding is about a topology that
  still exists upstream, not one that 94 commits have since replaced.

### Slice 3 — easing moved wholesale

- All 104 lines moved to `packages/trailer-engine/src/easing.ts`;
  `apps/web/src/film/easing.ts` is a 15-line re-export shim, so the **13
  importers under `src/film/` are untouched**.
- Bundle proof rather than a green compile: `easeOutBack`'s `1.70158` constant
  appears in the emitted chunk.

**Finding, recorded not fixed — two `clamp` definitions that disagree at the
edge.** `easing.ts:62` is `Math.max(min, Math.min(max, v))`; `tokens.ts:54` is
`Math.min(hi, Math.max(lo, v))`. Identical whenever `lo <= hi`, but with
inverted bounds the first returns the **lower** bound and the second the
**upper**. A behaviour change in a degenerate case, so it belongs in its own
slice with its own test rather than folded into a move.

### Slice 4 — playhead advance extracted

**Checked for a live owner first, and the obvious check lied.** A cwd sweep for
processes in `dev/active/mlai` returned six PIDs — all cwd'd in
`mlai-website-app/.data/releases/mlai-clean-*`, a path that merely *contains*
the substring `dev/active/mlai`. **A substring match on a repo path hits every
sibling repo whose name extends it.** HEAD `2718e0c` was committed at 07:35,
nine hours before this session opened.

- `advance(time, dt, duration, loop)` moved to
  `packages/trailer-engine/src/timeline.ts`. `engine.tsx` keeps its `setTime`
  updater and structure; only the math is delegated. Behaviour unchanged by
  construction.
- Scope confirmed first: all four `<Stage>` consumers (`Film`, `Trailer`,
  `Mega`, `Explainer`) pass a real `DURATION` and none override `loop`.
- Six tests; two mutations kill them (snapping the loop wrap to `0`; relaxing
  `next < duration` to `<=`).

**Finding, recorded not fixed — a setter inside another setter's updater.**
`engine.tsx` calls `setPlaying(false)` from inside the `setTime` updater. React
may invoke an updater more than once, so it is not pure. Hoisting it changes
when playback stops relative to the render — a behaviour change on two live
routes, so it belongs in its own slice.

**Second finding — `advance` returns `NaN` when `duration` is 0** (`next % 0`).
Preserved rather than guarded; no caller passes 0 and `Stage`'s default is 10.

### Slice 5 — deterministic particle substrate

**The obvious next item was AudioEngine, and it was rejected as a slice rather
than attempted.** `neural-voice.ts` is React-free, so it looked ready to move,
but it imports `PERSONAS` from `./tokens` and is referenced by
`src/lib/csp.ts` — so moving it either drags MLAI brand data into a generic
engine package or requires parameterising the persona registry, and it touches
the CSP allowlist. **A design decision with architectural consequences, not a
move.** Surfaced rather than taken unilaterally.

- **`random.ts` — seeded RNG (mulberry32).** Coerces the seed to uint32 so a
  negative or fractional seed yields a stable sequence instead of `NaN`.
- **`particles.ts` — `ParticleBuffer`, structure-of-arrays.** Nine parallel
  typed arrays rather than per-particle objects carrying generated color
  strings, so a scene's update loop allocates nothing per frame.
- **`seedAll` seeds the whole capacity, not the active count** — otherwise
  raising quality mid-scene exposes unseeded particles at 0. Mutating
  `capacity` to `count` kills that test.
- 10 tests; two mutations kill them.

**Corrected my own rule while here.** The barrel previously said nothing in it
may "touch the DOM" — wrong for the engine this package is meant to become,
since Web Audio, canvas and rAF *are* browser APIs. The rule now reads: no
React, no bundler globals, and no browser API at module scope.

### Slice 6 — PlaybackController

- States `idle | starting | playing | paused | ended | error`. `starting` is
  deliberately distinct from `playing`: acquiring an AudioContext is async and
  can fail, and collapsing the two is what lets a second start slip in
  mid-acquisition.
- Every `start()` claims a generation and every late completion checks it, so a
  superseded run cannot touch the run that replaced it.
- 12 tests covering the plan's lifecycle list.

**Mutation testing caught a vacuous test of mine.** Removing the generation
guard before `set("playing")` left the suite **green**: the race test started
run 1, superseded it, started run 2, and asserted `playing` — but *both* runs
end in `playing`, and `set()` no-ops when the state already matches, so the
missing guard was unobservable. Fixed with a test where the newer run is
**paused** when the older resolves.

### Slice 6 shipped a real defect. Found by review, proven by test, now fixed.

**`PlaybackController` leaked on the plain replay path**, and the "fixed
structurally" claim was overstated when written. The class exists to guarantee
exactly one live resource, and it broke that guarantee by **inferring resource
ownership from the state machine** instead of tracking it.

- `start()` disposed only when coming from `paused`. But `end()` leaves the
  machine in `ended` still holding its resources, so `play -> end -> start` —
  the plain replay path, one of the plan's own listed cases — ran `onStart`
  again with the first resource still live. Proven, not argued: a probe test
  reported `expected 2 to be 1`.
- **The suite was green throughout.** The existing replay test calls `stop()`
  between `end()` and `start()`, taking the disposal path and hiding the case.
- **Fixed by tracking ownership explicitly** (`held`), set *before* `onStart` so
  a partial acquisition that then throws is still released, and checked in both
  `start()` and `stop()`. `isActive` became `holdsResources`, true through
  `ended` — reaching the end frees nothing; only `stop()` or the next `start()`
  does. The old name asserted the opposite and encoded the bug.
- Three mutations pin it: reverting to the `paused`-only dispose fails 2 tests,
  marking `held` after `onStart` fails 5, dropping the generation guard fails 1.

**Stated no wider than the evidence supports:** two defects in this module were
invisible to a green suite, and in both cases the test that should have caught
it was written to a path that avoided the bug. Mutation testing found the first;
a reviewer found the second. Neither was found by the gate.

### This checkout is 4 ahead and 94 BEHIND origin/main (measured after fetch)

Surfaced 18:2x while answering a peer session about to act on this tree.
Measured after `git fetch`, not off the cached tracking ref.

- The **4 ahead are not this goal's**: `419f08b`, `7b5a8e9`, `1b9f5ec`,
  `2718e0c`, all `research` commits authored 01:04-07:35 on 2026-09-08, before
  this session opened at 16:34. Nothing in this goal is committed.
- The **94 behind** means every slice above is built on a `main` that is 94
  commits stale. The gate is green against *this* tree; it has never been run
  against the reconciled one. **Do not read green gates as evidence that this
  work integrates with `origin/main`.**
- A peer session independently confirmed `origin/main` is now `cf8cefd` and
  byte-identical to `~/dev/active/MLAI-CORPORATION-WWW`, which is 0 ahead /
  0 behind — so that second permanent checkout is the source of the 94.
- Reconciling is Donald's decision, not this goal's: a rebase here touches four
  commits belonging to someone else's work.

### Ledger recovery note — this section was rebuilt 18:3x after I truncated it

**I destroyed this file and rebuilt it from the session transcript.** A malformed
one-liner opened `tasks/goals.md` for write (truncating it to 0 bytes) and only
then read it, so the read returned empty and the write persisted nothing. The
four pre-existing goal sections were recovered intact from `HEAD`; everything
above in this section is uncommitted work that existed only in the working tree
and was retyped from the conversation record.

Two consequences worth carrying: the pre-existing sections are byte-exact from
git, but **this section is a faithful reconstruction, not the original bytes** —
if a detail here reads oddly, the transcript is the authority. And the mechanism
is general: in Python, `open(p,'w')` truncates at open time, so any
`open(p,'w').write(open(p).read()...)` shape destroys the file before reading it.
Read fully, close, then write.

### Gate history

Every entry read from the gate's own recorded exit code, never a wrapper's.
`bun run check` = `check:topology && check:web && check:mobile && check:quasar`.

| After | topology | web | mobile | quasar | exit |
|---|---|---|---|---|---|
| slices 1-3 | 9 paths | 377/43 + build | 41/41 + export | 60 pass + export | 0 |
| slice 4 | 9 paths | 377/43 + build | 41/41 + export | 60 pass + export | 0 |
| slice 5 | 9 paths | 387/44 + build | 41/41 + export | 60 pass + export | 0 |
| slice 6 | 9 paths | 399/45 + build | 41/41 + export | 60 pass + export | 0 |
| slice 6 fix | 9 paths | **401/45** + build | 41/41 + export | 60 pass + export | **0** |

`/showcase/film` and `/showcase/trailer` stayed at 1.41 kB / 1.4 kB throughout —
the extraction-equivalence signal the plan asked for. Local green is not hosted
CI and not a deploy, and per the divergence note above it is not evidence of
integration with `origin/main`.

### Open

- A visual and audible review by Donald of `/showcase/abbey` (the preview
  server from `.claude/launch.json` was left running on :3000 at 14:1x).
- Phase 4 remainder: a screen-reader pass by a person (VoiceOver on the
  transcript, the live caption and the slider). The CSP needs no change for the
  new route: it adds no script origin or external asset beyond what the film
  already uses, and the one new inline `<style>` is covered by the existing
  `style-src 'unsafe-inline'`.

### Phase 4 slice 2, 2026-09-16 14:2x-14:3x: focus ring and hidden-chrome tab order

- **Focus ring.** The transport bar carries a scoped `:focus-visible` rule
  (2px `#7cb0ff`, offset 2px) on its buttons and slider; pointer clicks show
  nothing. Verified with real Tab/Shift-Tab in the preview: the slider and the
  play button both matched `:focus-visible` with that outline.
- **Slider keys needed no new code.** The Stage's window handler already scrubs
  on arrows and jumps on Home from a focused `div`, and cancels Space's native
  button activation so a focused play button toggles once.
- **Defect found and fixed: the site chrome behind every cinematic route was
  still in the tab order.** `CinematicShell` covers the navbar and footer
  visually only, so on `/showcase/abbey` the focus order ran through 10
  navbar links and 30 footer links the user could not see. The shell now marks
  every sibling of `<main>` `inert` while mounted and removes exactly what it
  added on unmount. Verified: on the route, focus order is the six shell
  controls; after "Back to the showcase", zero `inert` elements remain and the
  navbar's links are focusable again. Applies to all six cinematic routes.
- **Gate:** check:topology exit 0; `NEXT_DIST_DIR=.next-gate bun run
  check:web` exit 0 (53 files, 465 tests, full route table) beside the running
  dev server. The build rewrote `tsconfig.json` and `next-env.d.ts`; both
  were restored, and `apps/web/CLAUDE.md` now names both.

### Phase 4 slice 1, 2026-09-16 14:1x-14:2x: accessibility, reduced motion, adaptive quality

- **Visual reduced motion is a different grammar, not fewer particles.** Under
  `prefers-reduced-motion: reduce`, `AbbeyCanvas` shows each cue as its
  settled constellation (`seek()` to the cue's end) and changes cues with a
  400 ms fade; no continuous motion is drawn. Evaluated from the media query,
  re-evaluated on change, never inferred from hardware.
- **Adaptive quality from measured frame time only.** An exponential average of
  the draw cost steps the sequencer's `quality` budget down by 0.2 (floor 0.3)
  when frames exceed 14 ms and back up when under 7 ms. The package gained
  `SceneContext.quality` and `SceneSequencer.setQuality()`; scenes size their
  particle count through `particleBudget()` with a 400-particle floor, applied
  at the next activation. Pinned by a test.
- **Transcript.** A `<details>` panel lists every caption with its speaker as
  React text nodes beside the `aria-live` caption; the canvas is
  `aria-hidden`.
- **Transport semantics (Stage-wide, so every film benefits):** the transport
  buttons gained `type="button"` and `aria-label`; the scrub track is now a
  `role="slider"` with `aria-valuemin/max/now/text`, focusable, with Home/End.
- **Gate, 14:2x:** `check:topology` exit 0; typecheck and the 53-file /
  465-test suite green. The first `next build` ran beside Donald's preview dev
  server, exited 0 and printed a route table of zeros with a 17-byte
  `app-build-manifest.json`, so it was not counted. `apps/web` then gained a
  `NEXT_DIST_DIR` escape (as `website-app` has), and
  `NEXT_DIST_DIR=.next-gate bun run build` exited 0 with the real table
  (`/showcase/abbey` 1.41 kB, shared JS 104 kB) while the dev server kept
  running. That build rewrote `tsconfig.json`'s `include`; it was restored and
  the typecheck rerun clean. The trap and the escape are now in
  `apps/web/CLAUDE.md`.

### Phase 3 slice 3, 2026-09-16 14:1x: narration on the new trailer

- `AbbeyNarration` in `AbbeyTrailer.tsx` mirrors `TrailerNarration`: it fires
  each caption through the shared `speak()` as the true playhead (`clock`)
  crosses its start, stops and re-arms on a seek back, mirrors play/pause to
  the voice engine, and primes the nine lines. The Stage is gated on
  `useVoiceReady()` and carries the `VoiceToggle`, so the trailer behaves like
  the film: no line is crossed before the model can speak it, and reduced
  motion is honoured through the same engine path.
- **Verified in the preview:** with the toggle on, the gate opened (status
  `ready`, no `[NeuralVoice]` warning; the Hugging Face download warning shows
  the loader ran), and the clock advanced at 1.0× while the Abi caption sat
  in the `aria-live` region. **Not verified:** that sound came out; nobody
  listened.
- `.claude/launch.json` (local, git-excluded) now names both previewable
  servers: `mlai-web` on :3000 and `mlai-website-app` on :3100. Mobile and
  Quasar are Expo bundlers, not web servers to preview.
- **Gate trap, recorded because it read like a code fault:** `check:web` failed
  once with `Cannot find module for page: /api/auth/logout/route` (ENOENT)
  during "Collecting page data", while the preview's `next dev` was running.
  Both share `apps/web/.next`; the route files were on disk. Stopping the dev
  server and rerunning gave exit 0 (53 files, 464 tests, build). Never run
  `check:web` with a dev server up in the same checkout.

### Phase 3 slice 2, 2026-09-16 14:0x-14:1x: the seven cues, mounted at `/showcase/abbey`

Donald chose a **new route** over replacing `/showcase/trailer`, so the
existing 62 s Vision Trailer is untouched.

- `apps/web/src/abbey-trailer/scenes.ts`: `MonolithScene`, `ShatterScene`,
  `PersonaRingScene` (used for Abi, Aviva, Abbey), `ConvergenceScene`,
  `FinalMarkScene`, and `buildAbbeyTimeline(palette)` returning seven
  contiguous cues (38 s) plus nine caption windows. The palette is an
  argument (tokens.ts `PERSONAS` in the app), so the module imports no brand
  data. Every impulse and layout is rolled in `enter()` from the cue's seed.
- `AbbeyTrailer.tsx`: `Stage` + `Canvas2DRenderer` + `SceneSequencer` over a
  1600-particle buffer; jumps over 0.5 s go through `seek()`.
- Route, metadata, sitemap, showcase card (index 06). Five Node tests.
- **Copy rule applied:** every caption reuses a line already shipped in
  `Trailer.tsx`; the test asserts no caption contains a digit.
- **Gate:** check:topology and check:web, 53 files / 464 tests / build, exit 0.
  `/showcase/abbey` 1.41 kB; the other showcase routes moved by 0.01 kB from
  the metadata table growing.
- **Visual pass** at t=4 (slab formed), 8 (burst), 13 (cyan Abi ring with
  label), 28 (three rings merging), 34 (hexagonal mark, "This is MLAI."):
  each matched the intended frame; no console errors.
- **One thing learned about the harness, not the code:** `engine.tsx:162`
  pauses the Stage on `visibilitychange`, and the browser pane's screenshot
  hides the document for a moment, so every screenshot pauses playback. The
  scrub keys also match on `e.code`, which the pane's key injection did not
  set; scrubbing was driven by dispatching `KeyboardEvent`s with `code` from
  inside the page. Neither is a defect to fix here.

### Phase 3 slice 1, 2026-09-16 13:5x-14:0x: the scene grammar, package-only

- `packages/trailer-engine/src/sequencer.ts`: `LifecycleScene`
  (`enter`/`update(dt, local)`/`draw`/`exit`), `SceneCue` (start, duration,
  seed) and `SceneSequencer`, a `Scene` the renderer drives. enter runs once
  per activation with a `createRandom(seed)` context and the shared
  `ParticleBuffer`; exit runs on every switch, on resize (re-layout, not
  stretch) and on dispose; a backward move re-enters and replays the same seed.
- **One design flaw found by its own test and fixed before commit.** The first
  version detected a backward move by comparing local time to the *integrated*
  time, but integration lags the playhead on purpose (the `MAX_FRAME_DT` stall
  clamp), so after a few clamped frames a real backward move read as forward
  motion. Now `lastLocal` is tracked separately. The consequence is stated in
  the code: `draw()` cannot tell a scrub from a stalled tab, so a forward jump
  is clamped (the picture may lag, never skip), and a host that knows it is
  scrubbing calls the new `seek(t)`, which re-enters and integrates to the
  target in bounded steps so a scrub lands on the frame playing would have
  reached.
- Eight Node tests: lifecycle order across a boundary, backward re-entry with
  identical seeded rolls, seek exactness (15 steps for one second), stall
  clamping, substepping, gaps, resize and dispose, and the duration guard.
- Not yet: any concrete scene, any page. `apps/web` is unchanged by this slice
  apart from the test file.

### Closed 2026-09-16 13:1x-13:5x, on Donald's decisions, with Phase 2 finished

Donald answered the three open decisions in one pass; each is recorded with
the ruling and what it changed.

- **Latency claim: drop the number.** No trailer copy carries a numeric latency
  figure. `apps/web/docs/master-reference.md:209` stays as the disclosed
  `reported` source for the 110 ms figure; the scene grammar writes that beat as
  non-numeric copy. No file changed for this; it binds Phase 3.
- **Colours: persona colours.** `tokens.ts` `PERSONAS` (Abbey green, Aviva
  violet, Abi cyan) stays the film's source. The planned rewire of `tokens.ts`
  onto `@mlai/design-tokens` is **dropped, not deferred**: `productColor` is a
  product map (`abi` violet) and only four hex values coincide, so a rewire
  would have been a brand decision in disguise. `productColor` is product-only.
- **AudioEngine: registry passed in.** Shipped as `f456c9e` + `490ec56`:
  `packages/trailer-engine/src/audio.ts` takes `PersonaVoiceRegistry`,
  `loadTTS`, `createAudioContext`, `prefersReducedMotion` and a `Scheduler` as
  constructor arguments, disposes through a generation token, and never
  touches `window`, `console` or `setTimeout` itself. `neural-voice.ts` is the
  brand adapter (registry, pronunciation rows, Kokoro loader in
  `kokoro-loader.ts`) with an unchanged `NeuralVoice` surface, so the two
  consumers did not change. Ten Node tests with hand-written fakes.
- **Renderer seam.** `renderer.ts` (`Renderer`, `Scene`, `DrawContext`,
  `Canvas2DRenderer`) and `neural-scene.ts` (`NeuralScene`, `buildNet3D` with
  an injected random source and intensity read). `neural.tsx` is now a React
  shell that owns the colour presets and the canvas lifetime. Five Node tests.
- **Two premise corrections found while doing it, recorded so nobody re-derives
  them.** (1) `/showcase/film` and `/showcase/trailer` contain **no canvas**;
  the only canvas in `film/` is the neural galaxy used by `/showcase/mega` and
  `/showcase/explainer`, so those two are the Renderer slice's equivalence
  check and film/trailer are the null check. (2) The film's pixel ratio is a
  **hardcoded 2** on a 1920×1080 logical frame, not a capped
  `devicePixelRatio`; `Canvas2DRenderer.resize` takes `dpr` as an argument and
  the shell passes 2, so output is unchanged on 1× displays.
- **One trap that bit and is now written down:**
  `apps/web/node_modules/@mlai/trailer-engine` is a **copy**, not a symlink.
  A new package file is invisible to `tsc` and Vitest until
  `cd apps/web && bun install` re-runs (its `bun.lock` does not change).
  Never run that install at the repo root.
- **What has no automated coverage, said plainly:** the Kokoro CDN path and
  the React shells. The gate proves the engine and scene logic, the typecheck,
  and that route sizes did not move; it does not prove audio plays.
- **Manual smoke, 2026-09-16 13:5x-14:0x, dev server on :3000 in the built-in
  browser.** `/showcase/mega`: one canvas at 3840×2160, the chaos-red net
  animating at t=0.12, sampled pixels lit over the base, no console error from
  the page (one stray `/showcas` 404 came from the pane). `/showcase/film`:
  the voice toggle defaults on, the `Stage` gate opened and the playhead
  advanced (0:00.01 → 0:02.56) with **no `[NeuralVoice]` warning**, which is
  the `ready` path, not `error`; the Hugging Face hub download warning
  confirms the loader ran. Not verified: that sound came out. No one listened.

Acceptance: `done` only when the scene grammar ships on an extracted engine with
the root gate green **against a reconciled main** (satisfied as of `9b75f6b`)
and the latency copy resolved (decided: no number). Phase 2 is complete; the
goal stays `in_progress` for Phases 3 and 4.
Six green gates on a 94-behind tree are slices, not the goal.

### A third session wrote and STAGED in this tree concurrently (18:1x-18:3x)

Found 18:3x, after I had already told a peer session this tree was mine.
**That claim was right about the work and wrong about the tree.**

- `apps/web/.design-sync/NOTES.md` is **staged in the index** (`M ` in
  `git status`), modified 18:31:52 — not by this goal, which has staged nothing.
  About ten files under `apps/web/.design-sync/` were written in the preceding
  twenty minutes.
- Its own new entry describes a "Re-sync run (2026-09-08 18:1x)" uploading 222
  files writes-only, and notes that
  `~/dev/active/MLAI-CORPORATION-WWW/apps/web/.design-sync/` holds a
  byte-identical `config.json` pointing at the **same remote `projectId`**.
- No process was cwd'd in the repo by the time I swept, so that session had
  finished or drives absolute paths from elsewhere. **Nothing of theirs was
  touched and the staged file is left exactly as found.**

**This is a sharper hazard than the 94-behind divergence, because it needs no
push to do damage:** a bare `git commit` in this tree now sweeps a third party's
staged work in with whatever the committer meant to include. Commit with an
explicit pathspec here, never `-a` and never a bare `git commit`.

It also means three trees are in play around one upstream — this one,
`~/dev/active/MLAI-CORPORATION-WWW`, and the `~/Downloads/files (1)` checkout —
with at least two of them sharing design-sync state against one `projectId`.

### The design-sync re-sync ran FROM this 94-stale tree, against a shared remote project

Verified directly 2026-09-08 18:3x, not taken from the peer's report:

- `apps/web/.design-sync/` is **tracked** here — 40 files, including
  `config.json`, `NOTES.md`, `conventions.md` and 30+ `previews/*.tsx`.
- `config.json` is **byte-identical** between `~/dev/active/mlai` and
  `~/dev/active/MLAI-CORPORATION-WWW`, and both carry the same
  `projectId 6d97fa83-1224-4573-9c22-46f67ac46f3c`. A peer reports its
  `~/Downloads/files (1)` checkout also tracks a `.design-sync/`, so the shared
  state spans at least three trees against **one remote project**.
- `~/dev/active/MLAI-CORPORATION-WWW` is clean at `cf8cefd`, which is
  `origin/main`.

**The consequence, which the earlier note understated.** The 18:1x re-sync that
uploaded 222 files writes-only ran from **this** checkout — the one that is 94
commits behind `origin/main`. Its 41 re-verified sheets were therefore built
from sources 94 commits stale, and uploaded to a remote project that the
up-to-date tree (`MLAI-CORPORATION-WWW`, at `origin/main`) also feeds. A
writes-only upload from one tree is not scoped to that tree.

Whether that is a problem depends on whether any of those 94 commits touched
the components those sheets render. **Not measured here, and not this goal's to
resolve** — but it should be checked before the next re-sync, because the same
shape will recur every time a session runs design-sync from whichever checkout
it happens to be sitting in.

**Measured, and it looks clear — with a stated limit.** The drift between this
tree and `origin/main` under `apps/web/src/{components,design}` is **6 files**:
`Footer.tsx`, `Hero.tsx`, `Navbar.tsx`, `PageHeader.tsx`, `ScrollToTop.tsx`,
`research/index.tsx`. **None of the six has a matching sheet under
`.design-sync/previews/`** — they are page-level composition, not the primitives
the 41 sheets render. So the stale upload most likely rendered current content.

**The limit on that check, stated rather than glossed:** it matches sheet names
to file names, so it would miss a sheet that imports a drifted file
transitively. Confirming properly means resolving each sheet's import graph, and
that is worth doing before the *next* re-sync rather than retroactively. The
structural hazard stands regardless of this particular run's outcome: design-sync
uploads from whichever checkout a session happens to occupy, and two of those
checkouts are 94 commits apart.

## Re-sync the MLAI Lab design system to Claude Design
status: done

- 2026-09-16 20:1x: `/design-sync` re-run against the pinned project `6d97fa83` ("MLAI Design
  System") from this checkout at `d856a94`. 41 components unchanged; the compiled Lab stylesheet
  had moved with later `apps/web/src` commits, so the build was uploaded writes-only (222 files,
  0 deletes). Validate exit 0, render check 41/41 clean (5 deliberate floor cards). Details in
  `apps/web/.design-sync/NOTES.md`. A separate "MLAI Lab" Design System artifact
  (https://claude.ai/artifact/Y3kiSrwLA7XYaS3DJitkGq) was built the same evening from `apps/web`.

## Unify MLAI into one root Bun workspace and clean up
status: done

Captured 2026-09-16 20:3x EDT on Donald's request ("merge all into main and into one
project mega project and cleanup codebase ... /design-sync mlai"). He chose a single
root Bun workspace with one `bun.lock` over folding apps together, and approved the
cleanup of stale docs, the Dockerfile bug, unused web components, tracked screenshots
and `docs/sources` duplicates. Plan: `~/.claude/plans/merge-all-into-main-synchronous-beacon.md`.

- **Branches, 2026-09-16 20:4x:** PR #70 squash-merged as `fe41894`. Five remote
  branches whose tips were ancestors of `origin/main` (checked with
  `git merge-base --is-ancestor` before each delete) were removed:
  `claude/filimon-audit-web-stack-nqgaf9`, `console-workspace-files`,
  `console-workspace-handlers`, `workspace-oauth-deploy-wiring`,
  `revert-58-integrate/mlai-site-review`. `git ls-remote --heads origin` now lists
  only `main`.
- **Real bug found while surveying:** `apps/web/Dockerfile` copied only
  `packages/contracts` although web depends on `@mlai/trailer-engine`, so the Cloud Run
  image build would have failed at install. It never surfaced because the deploy job
  is skipped (no WIF credentials). Fixed as part of the workspace migration.
- Workspace migration and cleanup run in two isolated worktrees in parallel; design
  sync runs after both land.
- **Landed, 2026-09-16 21:2x EDT, on `build/root-workspace-cleanup` (PR #71).**
  - **Workspace:** every app except `apps/research-sites` (install-free) now
    installs from one root `bun.lock` with `linker = "isolated"`. `apps/quasar/templates/next-site`
    keeps its own lockfile. The four app lockfiles and the nested `workspaces` fields are
    gone, and `check-topology` now forbids both.
  - **React types:** the plan's Expo fallbacks were not needed, but the React type
    clash was real. Packages that import `react` in their types without declaring
    `@types/react` fell through to one shared copy. The fix: a root `@types/react` pin for
    the Next apps, `hoistPattern` excluding `@types/react*`, and a
    `tsconfig.typecheck.json` per Expo app that maps `react` to its own 19.0 types
    (Metro reads `tsconfig.json`, so the mapping cannot live there).
  - **Undeclared dependencies** the isolated layout exposed are now declared in mobile,
    both Expo apps (`query-string` for expo-router), web (`postcss`, `ts-morph`) and
    `@mlai/ui`.
  - **Dockerfile:** now installs from the root workspace
    (`--filter @mlai/platform --filter @mlai/web --frozen-lockfile`), which fixes the
    missing `trailer-engine`, and runs Next's standalone `server.js`.
  - **CI and `pages.yml`:** install at the root, and the topology job checks for
    lockfile drift.
- **Cleanup:**
  - Removed five unreferenced web components, `og-image.svg`, `start_dev.sh`, 35
    tracked verification/design PNGs (12.8 MB; still in history through `fe41894`), the
    landing tarball duplicated by its extracted tree, and the run-skill npm lockfile.
  - Stale docs corrected across root, web, research-sites, quasar and website-app.
  - **Kept on purpose:** the 25 byte-identical duplicate sets inside `docs/sources`,
    because its README promises each tree whole.
- **Measured on the merged tree (`fce283e`), in this checkout:**
  - Clean `bun install`: exit 0.
  - `bun install --frozen-lockfile`: exit 0, `bun.lock` unchanged.
  - `bun run check`: exit 0, all eight stages. Topology: 26 required paths, 4 forbidden
    lockfiles. web: 465 tests plus build. mobile: 59 Jest tests plus export. quasar: 69
    tests plus export. website-app: 138 Vitest plus 26 pytest plus build.
    research-sites: 11 tests plus build.
  - Both Expo bundles carry only React `19.0.0`.
- **Unmeasured or residual:**
  - `docker build` (Docker not installed; the agent built the Dockerfile's copy set
    locally and `server.js` served `/`, static and public assets with 200).
  - Hosted CI (billing lock).
  - CI pins Bun 1.4.0 while the lockfile was written by 1.4.2.
  - Expo exports now emit assets under `assets/__node_modules/.bun/…`.
  - `packages/design-tokens` is still unused, and Lab colors remain duplicated in five
    places.
  - About 20 older PNGs remain under `apps/website-app/docs/verification/screenshots/`.
  - `apps/research-sites/README.md` (generated) still names the old exporter location.
