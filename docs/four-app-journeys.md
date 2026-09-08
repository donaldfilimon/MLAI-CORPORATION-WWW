# Four-app core journey delivery

Baseline: `720b403`, canonical `/Users/donaldfilimon/dev/active/MLAI-CORPORATION-WWW` on `main`.
This record tracks the 2026-09-08 user-approved roadmap independently of historical integration receipts.

| Milestone | Implementation | Local acceptance | Delivery |
| --- | --- | --- | --- |
| Abbey | Implemented: derived progress, explicit provider checks, recovery, source review | Passed: 127 unit + 26 parser tests, build, browser 4/4 plus final live 1/1; all 15 evaluation outcomes retained | `50ebcf1`: CI 5/5, Pages published, Cloud Run deploy skipped |
| Public website | Implemented: product navigation, intent setup, research links, standalone Pages | 396 tests/build; three engines passed; 79-route crawl passed | `9a67562`: CI 5/5; Pages published; Cloud Run deploy skipped |
| Mobile companion | Implemented: fail-closed vault, serialized writes, retained drafts, stale-refresh guards | 59 tests/7 suites; TypeScript, lint, web export passed | `04bd7e8`: CI 5/5, Pages published, Cloud Run deploy skipped |
| Quasar | Implemented: persistent origin, bounded requests, cancellation and recovery | 69 tests, three typechecks, export/template build; isolated service + Chromium passed | `9ddb023`, delivered through `af58896`: CI 5/5, Pages published, Cloud Run deploy skipped |

Each milestone receives a scoped commit, affected-app gate, all-five-job hosted CI check,
and observed automatic Pages / Cloud Run outcomes. The final pass reran all four app gates.
Workspaces, lockfiles, authentication and storage stay independent. The active local installation
and provider settings are preserved. No cutover, provisioning, Vercel removal or agent deployment.

Native screen-reader, actual browser zoom, signed native CloudKit and provider-dependent
Quasar generation are distinct acceptance layers. Missing access is recorded, never inferred
from a web export, fixture test or local unit suite.

## Evidence handling incident

During Abbey acceptance, the first browser invocations used Playwright's default
`test-results` directory, replacing earlier ignored raw integration reports.
Committed historical receipts and screenshots remain unchanged; the old ignored
traces/HTML reports referenced by those receipts are no longer available here.
They were not reconstructed or represented as preserved. The default Playwright
output and HTML report directories now include the run UUID; explicit per-run
paths remain supported. Current and subsequent acceptance artifacts use new paths.

## Abbey acceptance

Node 24.20.0 / Bun 1.4.0; source digest
`214149fbfd35ad7d94f1a9735572223604ea9b29e0bc1fc981c3bab1c289fc3f`.
Formatting and research verification passed. The new browser coverage and original
workflow passed four checks; final live request-count assertion passed separately.
[Citation evaluation](../apps/website-app/docs/verification/journeys-abbey-citations-final-20260908-0902.json)
contains all 15 outcomes: zero retrieval, application mapping, authorization or
execution failures; one source-selection annotation error; zero insufficient-
evidence errors. This is bounded synthetic evaluation, not semantic certification.
[Browser receipt](../apps/website-app/docs/verification/journeys-abbey-browser-20260908.json)
records recovery, responsive source inspection, real downloads, progress persistence
and cancellation. A reproduced Stop-button default action was fixed so restoring
a draft cannot submit it again during the same click.

Abbey delivery `50ebcf168561c834d51ad922227b1097c95a7acc`:
[CI 34229336665](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/actions/runs/34229336665) passed all five jobs;
[Pages 34229498990](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/actions/runs/34229498990) published;
[Cloud Run 34229499100](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/actions/runs/34229499100) completed readiness and skipped deploy.
Public `https://quesar.cloud/` returned HTTP 200 and matched the committed static index byte for byte.

## Public website acceptance

The [browser receipt](../apps/web/docs/verification/journeys-web-20260908.json) records
Chromium, Firefox and WebKit navigation, research filtering/search, original PDF bytes,
mobile menu focus, and standalone Pages at 390/768/1440 pixels. Production CSP stayed
enabled through a temporary HTTPS loopback proxy; only its self-signed test certificate
was accepted. WebKit uses macOS Option-Tab to include links in keyboard traversal.
A reproduced reduced-motion hydration defect left headings transparent; explicit final
animation targets and computed-opacity browser assertions now cover it. Historical failed
harness runs remain under unique `output/playwright/journeys-web-20260908-*` directories.
The app gate passed 396 tests across 44 files and built successfully on Node 24/Bun 1.4.
Native screen-reader and actual browser zoom checks remain unperformed.

Final crawl: 79 routes, 13/13 assets, 76/76 click-throughs and 2/2 fragment targets passed.
The protected console returned its expected 401 challenge.

Website delivery `9a675621143998dd71e0542e95740de04564ad31`:
[CI 34231715002](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/actions/runs/34231715002) passed all five jobs.
[Cloud Run 34231890893](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/actions/runs/34231890893) completed readiness and skipped deploy.

[Pages 34231890848](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/actions/runs/34231890848) published successfully.

Published website verification: `https://quesar.cloud/` returned HTTP 200 and matched
static index SHA-256 `defa90f7ba9592c52c86b9e2721fee896f1b23da19ba6ea3c230c2c74f96c8ad`.

## Mobile acceptance

[Mobile receipt](../apps/mobile/docs/verification/journeys-mobile-20260908.json) records
59 tests across seven suites, TypeScript, lint and Expo web export on stable source.
Storage faults preserve bytes; concurrent local changes serialize; refresh and save
failures retain drafts and notes. Review caught and fixed an early-save/initial-load
race, now covered by a deferred-load regression. Native CloudKit errors cannot
silently select local storage. Account availability is labeled without claiming sync.
The unchanged storage format/key and native CloudKit record definitions remain in use.
Signed-device CloudKit acceptance is unperformed; the local queue spans one JS runtime.

Mobile delivery `04bd7e848e155c69b1bc2b588064d5ec6f76d455`:
[CI 34232333027](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/actions/runs/34232333027) passed all five jobs;
[Pages 34232497919](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/actions/runs/34232497919) published;
[Cloud Run 34232497824](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/actions/runs/34232497824) skipped deploy after readiness.

## Quasar acceptance

[Quasar receipt](../apps/quasar/docs/verification/journeys-quasar-20260908.json) records
69 tests, three workspace typechecks, Expo export, a frozen template install/build,
and isolated actual-service/Next-preview/Chromium acceptance. Settings survive reload;
changing origins clears old sites; disconnect/retry restores the preview. A create
was committed and its browser response deliberately lost: another click sent no
second POST, and explicit recovery found one site with one prompt-history entry.
The verifier stopped all owned listeners and removed only its disposable data.

Review and browser execution exposed two defects that were fixed: overlapping
recovery could clear newer write uncertainty, and an unbound browser fetch call
failed with an illegal receiver. Deferred regressions and real-browser checks cover
both. Generation remains an explicit fixture. Existing Anthropic API-key/auth-token
environment variables and the SDK profile were absent, so live Anthropic acceptance
is blocked. No provider configuration or active installation was replaced.

## Final local gate repeat

Node 24.20.0 / Bun 1.4.0: topology, pinned Actionlint and five root tooling tests
passed. Abbey passed 127 unit tests, 26 parser tests, formatting, research verification
and build; web passed 396 tests and build; mobile passed 59 tests, typecheck, lint
and web export; Quasar passed 69 tests, three typechecks and web export, with its
independent template frozen install/build. No app source changed during these final
app gates; subsequent edits add verification/evidence and delivery status only.

## Hosted retry synchronization repair

The first Quasar delivery attempt, `9ddb023`, passed four hosted jobs but failed
two mobile component retry assertions in [CI 34233985128](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/actions/runs/34233985128).
Pages correctly skipped publication; Cloud Run skipped deploy. The tests used
synchronous events around asynchronous React updates. The follow-up awaits the
installed async-act event helper and asserts exact retry call counts, without
changing app code or increasing timeouts. Six focused CI-environment repeats and
the full 59-test mobile gate passed. The specific Linux schedule was not reproduced
locally; the [repair receipt](../apps/mobile/docs/verification/journeys-mobile-ci-sync-20260908.json)
records that limit. The follow-up hosted result is recorded below.

## Delivered implementation set

All four milestones are committed on canonical `main`. The final implementation/test
set is `af5889640876421e21aad667967046d65ad69859`, incorporating Quasar `9ddb023`.
[CI 34234516796](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/actions/runs/34234516796) passed all five jobs;
[Pages 34234656663](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/actions/runs/34234656663) published;
[Cloud Run 34234656690](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/actions/runs/34234656690) completed readiness and skipped deploy.
The public static page returned HTTP 200 and matched the committed index. The
full Next application was built and tested locally; an unconfigured Cloud Run
skip is not a production release of its routes.

[Consolidated receipt](verification/four-app-journeys-20260908.json) records all
delivered milestones, local gates and remaining acceptance boundaries. Subsequent
closeout changes only update documentation/evidence; their hosted run is visible
in GitHub Actions for that commit. The active local app at port 3100 and model at
3102 remained available, and all verification-owned listeners were stopped.

Remaining acceptance: live Anthropic generation (no credentials/profile), signed
CloudKit/device execution, native screen-reader and actual browser zoom. The
local 15-run citation evaluation retains one source-selection annotation error,
with no retrieval, mapping or authorization failure. Historical raw report loss
is documented above; current receipt and screenshot paths are distinct.
