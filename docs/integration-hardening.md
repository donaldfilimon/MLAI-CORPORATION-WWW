# Integration hardening and acceptance — 2026-09-08

## Current status

Implementation and bounded local acceptance are complete on canonical `main` in
`/Users/donaldfilimon/dev/active/MLAI-CORPORATION-WWW`. Implementation commits are
`e9f228c` and `3ce1f0c`. Four apps remain independent: production `apps/web`,
Expo `apps/mobile`, nested Bun `apps/quasar`, and local `apps/website-app`.
Existing installations, private data, authentication and provider configuration
were preserved. Historical imported receipts below other ledgers are not current
acceptance evidence.

The accepted application runtime source SHA-256 is
`77e2ed9dbd2bdef05869ef3491d633b53caa67e8d2b50c5888c326eb234d5de9`.
Local imported-app acceptance used Node **24.20.0** and Bun **1.4.0**.
The evidence-only closeout commit preserves this digest.

## What changed

- Initialize CI scratch data through `$RUNNER_TEMP` and `$GITHUB_ENV`, retaining
  serial migration before build. Root workflow validation uses pinned Actionlint
  1.7.12; topology CI runs it and tooling regressions.
- Root app checks allocate and clean only an owned temporary store unless an
  explicit `MLAI_DATA_DIR` is supplied. Empty overrides fail. Parser checks use
  the frozen installed environment; dependency/model setup remains explicit.
- Authenticated Playwright requests and Origin headers use configured baseURL.
  App port defaults to 3101 and fixture port to 3112, with separate overrides.
  UUID data stores and refusal to reuse occupied servers remain intact.
- Explicit verifier `--output` destinations create new receipts exclusively;
  historical defaults remain unchanged. Nested release packaging regressions
  cover workspace inclusion and sibling/private/generated exclusions.
- Interactive document search returns keyword matches after a bounded optional
  semantic lookup, propagates cancellation, and exposes pending/fallback/error
  states. Research input ignores stale asynchronous URL snapshots so rapid typing
  and browser history work together.
- Process cleanup tolerates a macOS redundant-kill EPERM only after proving no
  live process-group members remain. Genuine permission and inspection errors
  still fail. Browser screenshots use per-run artifact paths.

## Verified local acceptance

| Gate | Result |
| --- | --- |
| Workflow validation / topology / tooling | Passed; Actionlint 1.7.12; 5 tooling tests, 19 assertions |
| Production web | 391 tests in 43 files; production build passed |
| Mobile | 41 tests in 7 suites; TypeScript, lint and Expo web export passed |
| Quasar | 60 tests; workspace typechecks and Expo web export passed |
| Imported app | 123 tests in 15 files; 26 parser tests; TypeScript and production build passed |
| Formatting / research | Passed; 6 topics, 21 publications, 7 studies, 4 attachments |
| Fresh installation | Frozen installs, 23 parser formats, development UI regeneration, production startup, account/project creation, restart persistence and process cleanup passed |
| Public browsers | 6/6 across Chromium, Firefox and WebKit: keyboard/focus, reflow, PDF evidence, rapid typing and history |
| Non-live Chromium | 19/19 on port 3121: accounts, authorization, discovery, upload, source inspection, persistence and responsive views |
| Deterministic Agent | 2/2 on app 3121 and fixture provider 3122: confirmation, idempotency, recovery, cancellation |
| Live integration and Agent verifiers | Passed against explicitly selected existing local services, with isolated stores |
| Live browser | Unchanged repeat passed 2/2 on app 3123; initial run 1/2, with a model citation error retained below |

Receipts:

- [Fresh installation](../apps/website-app/docs/verification/integration-e9f228c-clean-install.json).
  Its base was e9f228c while source changes were uncommitted; its recorded runtime
  digest exactly matches committed 3ce1f0c. Disposable release was removed.
- [Local services](../apps/website-app/docs/verification/integration-3ce1f0c-local-services.json).
- [Agent recovery](../apps/website-app/docs/verification/integration-3ce1f0c-agent-recovery.json).
- [Browser acceptance](../apps/website-app/docs/verification/integration-3ce1f0c-browsers.json).
  Raw reports/traces were originally saved in ignored app-local `test-results/integration-3ce1f0c-*`. A later roadmap acceptance run replaced that ignored directory; see the [evidence handling incident](four-app-journeys.md#evidence-handling-incident). Committed receipts remain intact.

Local model preflight advertised `mlx-community/Llama-3.2-3B-Instruct-4bit` at
`http://127.0.0.1:3102/v1`. Verifiers used explicit existing ABI and WDBX gateway
executables under `/Users/donaldfilimon/dev/active/abi/target/debug/`, synthetic
documents, isolated databases and dedicated gateway stores. Evidence covers
workspace-authorized citations, confirmation before writes, exactly-once writes,
restored requester authority, source downloads, worker/restart recovery,
cancellation, and gateway credentials/TLS/mTLS/timeouts/disconnects.

The first live chat browser run answered the deadline correctly but the model
cited the heading chunk rather than the supporting paragraph. The retained stream
trace proves the application opened the supplied source the model selected.
The unchanged full repeat passed, with no weakened assertion or fixture swap.
This observed model citation unreliability remains a limitation; passing bounded
acceptance does not establish semantic correctness for every model answer.

## Reproduce

Use Node 24.x and Bun 1.4.0 plus the app's documented uv/Python, Java and
LibreOffice prerequisites. Keep all app workspaces and lockfiles independent.
From the repository root:

```sh
bun run install:all
# Explicit parser/model setup; use a dedicated setup store.
(cd apps/website-app && MLAI_DATA_DIR=/tmp/mlai-integration-setup bun run setup)
bun run check:workflows
bun run check:tooling
bun run check:topology
bun run check:web
bun run check:mobile
bun run check:quasar
bun run check:website-app
```

From `apps/website-app` (choose unused ports and new receipt names on every pass):

```sh
bun run format:check
bun run verify:research
bun run verify:clean-install --output docs/verification/NEW-clean-install.json
MLAI_E2E_PORT=3121 bun run test:e2e:public --output=test-results/NEW-public
MLAI_E2E_PORT=3121 bun run test:e2e --grep-invert 'real local|persistent reviewed agent|late conversation' \
  --output=test-results/NEW-non-live
MLAI_E2E_PORT=3121 MLAI_E2E_FIXTURE_PORT=3122 \
  MLAI_E2E_MODEL_URL=http://127.0.0.1:3122/v1 \
  MLAI_E2E_MODEL_ID=agent-browser-fixture bun run test:e2e tests/e2e/agent.spec.ts \
  --output=test-results/NEW-agent

export MLAI_MODEL_URL=http://127.0.0.1:3102/v1
export MLAI_MODEL_ID=mlx-community/Llama-3.2-3B-Instruct-4bit
export MLAI_ABI_BINARY=/Users/donaldfilimon/dev/active/abi/target/debug/abi
export MLAI_WDBX_BINARY=/Users/donaldfilimon/dev/active/abi/target/debug/abi-wdbx-gateway
bun run verify:integrations --output docs/verification/NEW-local-services.json
bun run verify:agent --output docs/verification/NEW-agent.json
MLAI_E2E_PORT=3123 MLAI_E2E_MODEL_URL="$MLAI_MODEL_URL" \
  MLAI_E2E_MODEL_ID="$MLAI_MODEL_ID" bun run test:e2e \
  tests/e2e/agent-live.spec.ts tests/e2e/live-chat.spec.ts \
  --output=test-results/NEW-live
```

Preflight the selected model's `/models` endpoint before live commands. Missing
services are blockers, not reasons to substitute hosted processing. CI's narrower
app gate omits parser setup, clean-install and browser/live acceptance; the local
results above are independent evidence. Read the [app setup guide](../apps/website-app/README.md)
for details. The root install helper is non-frozen; clean-install and CI require
frozen installs separately in the independent workspaces.

## Hosted delivery and remaining boundaries

For implementation SHA `3ce1f0c90c24b6d4274d00d157f128e3add2bd8b`:

- [CI 34221878917](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/actions/runs/34221878917): all five jobs succeeded (topology, web, mobile, Quasar, website-app).
- [Pages 34222027495](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/actions/runs/34222027495): publication succeeded; public HTTP acceptance is checked again at final closeout.
- [Cloud Run 34222027489](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/actions/runs/34222027489): readiness succeeded, deployment **skipped** because required WIF/project configuration is absent. This is not a Cloud Run release.

The final evidence-only commit is subject to the same CI and automatic deployment
checks; its final SHA and run outcomes are reported in the task closeout. Existing
validated-SHA checkout and repository-identity trust checks were preserved.

Native screen-reader and actual browser-zoom acceptance remain unperformed;
viewport/keyboard checks are not accessibility certification. No signed-device,
CloudKit or Expo native acceptance is claimed from web export. No public runtime
unification, production cutover, provider provisioning, Vercel deletion, Eve
deployment or replacement of the active local installation was performed.
