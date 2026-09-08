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
