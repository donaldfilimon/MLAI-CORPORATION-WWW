# Four-app core journey delivery

Baseline: `720b403`, canonical `/Users/donaldfilimon/dev/active/MLAI-CORPORATION-WWW` on `main`.
This record tracks the 2026-09-08 user-approved roadmap independently of historical integration receipts.

| Milestone | Implementation | Local acceptance | Delivery |
| --- | --- | --- | --- |
| Abbey | Implemented: derived progress, explicit provider checks, recovery, source review | Passed: 127 unit + 26 parser tests, build, browser 4/4 plus final live 1/1; all 15 evaluation outcomes retained | Pending |
| Public website | Pending | Pending | Pending |
| Mobile companion | Pending | Pending | Pending |
| Quasar | Pending | Pending | Pending |

Each milestone receives a scoped commit, affected-app gate, all-five-job hosted CI check,
and observed automatic Pages / Cloud Run outcomes. The final pass reruns all four app gates.
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
