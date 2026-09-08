# Website application integration — 2026-09-08

The local `mlai-website-app` main history through `d988a218efe747f2adf1ee073ec72ee249d69d76` is
merged into this repository under `apps/website-app`. The import also includes
its current uncommitted source, local lifecycle documentation, research receipts
and screenshots. The source checkout and its active runtime are retained.
The [source manifest](website-app-import-manifest.json) records all 284 imported
file hashes and the files adapted for integration. Ignored private databases,
credentials, documents, model weights, environments and build outputs were not copied.

## Architecture and commands

`apps/web` remains the canonical production website. `apps/website-app` retains
its independent Next.js runtime, SQLite/Better Auth, shared UI package, Python
worker and non-deployable Eve scaffold. Their authentication, data stores and
public routes remain distinct. This is a repository integration, not a runtime
migration or a deployment change.

Root `install:all`, `check`, `check:website-app`, `dev:website-app` and the topology
gate include the imported app. Its Bun workspace and lockfiles remain app-local.
Root CI has a website-app job with Node 24, Bun 1.4.0, frozen install, TypeScript,
formatting, research verification, unit tests, serial database migration and build.
The nested source workflow is retained for provenance; GitHub runs the root job.

The research verifier now streams large Git diffs into SHA-256 instead of using
a fixed output buffer, and scopes dirty-state detection to the application.
A regression test covers a diff over 1 MiB, sibling isolation and Git failure.
Playwright accepts `MLAI_E2E_PORT` to validate the imported app while another
checkout uses the default 3101; it still refuses to reuse an existing server.

## Validation from the integrated checkout

Local runtime: Bun 1.4.3 canary, Node 26.8.1, Python 3.13.14.

| Gate | Result |
| --- | --- |
| Root topology | Passed, 14 required paths |
| Existing web | Full check passed, 43 files / 391 tests and Next build |
| Existing mobile | Full check passed, 7 suites / 41 tests and Expo web export |
| Existing Quasar | Full check passed, 60 tests and Expo web export |
| Imported app frozen install | Passed without lockfile changes |
| Imported app setup | Passed, all 23 advertised document formats verified |
| Imported app full root gate | Passed, TypeScript/UI, 12 files / 107 tests, 26 parser tests, production build |
| Imported app formatting | Passed |
| Imported research evidence | Passed, 6 topics, 21 publications, 7 studies, 4 attachments |
| Public browser acceptance | Passed in Chromium, Firefox and WebKit at 320, 390, 768 and 1440 px |

Setup and the full gate used an isolated synthetic data directory at
`/tmp/mlai-website-import-validation`. Browser validation used port 3111 and
UUID-isolated synthetic data/build directories. Private source-checkout state
was not used. Research tests verified keyboard navigation, search persistence,
clear-button focus, narrow reflow, PDF downloads and absence of page errors.

The pre-existing edit to `apps/web/scripts/crawl-links.mjs` was preserved outside
the merge commit. Hosted CI, Node 24 execution, public deployment, the complete
authenticated browser suite and live ABI/WDBX/model integration were not run for
this import. Historical receipts carried from the source are not new acceptance
proof for this checkout. No source checkout, branch or worktree was deleted.
