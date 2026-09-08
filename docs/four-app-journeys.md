# Four-app core journey delivery

Baseline: `720b403`, canonical `/Users/donaldfilimon/dev/active/MLAI-CORPORATION-WWW` on `main`.
This record tracks the 2026-09-08 user-approved roadmap independently of historical integration receipts.

| Milestone | Implementation | Local acceptance | Delivery |
| --- | --- | --- | --- |
| Abbey | Implemented: derived progress, explicit provider checks, recovery, source review | Passed: 127 unit + 26 parser tests, build, browser 4/4 plus final live 1/1; all 15 evaluation outcomes retained | `50ebcf1`: CI 5/5, Pages published, Cloud Run deploy skipped |
| Public website | Implemented: product navigation, intent setup, research links, standalone Pages | 396 tests/build; three engines passed; 79-route crawl passed | Delivery pending |
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
