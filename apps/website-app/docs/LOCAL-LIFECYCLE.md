# Local verification and lifecycle

The canonical application and selected MLX service are operator-owned local
processes. This document does not install a login service, change providers, or
authorize release activation. Public Research verification needs neither a model
nor hosted credentials.

## Repeatable browser checks

Run build/typecheck gates and browser gates serially in the same checkout.
Per-run Next/data directories do not isolate `packages/ui/dist`: a concurrent
shared UI rebuild can temporarily remove a stylesheet and invalidate a live
development server. Do not hide the resulting HTTP 500s with fixture retries.

Run `bun run test:e2e` from `apps/website-app`. Each invocation allocates an
independent UUID under `.data-e2e/runs/` and `.next-e2e/runs/`, keeping application
data and generated Next output separate from canonical `.data`. Workers inherit
the same run ID. Screenshots use Playwright’s per-test output paths; supply
`--output test-results/<revision>-<gate>` to retain a distinct acceptance receipt
without overwriting imported historical screenshots. `MLAI_E2E_RUN_ID` can name
a deliberate recovery/reproduction run;
use only letters, numbers, and hyphens, and never share that ID concurrently.

Browser acceptance defaults to port 3101; set `MLAI_E2E_PORT` to an unused
application port when another owned process uses it. All application requests
and authentication origins follow Playwright’s configured `baseURL`. The
deterministic Agent provider defaults to port 3112; `MLAI_E2E_FIXTURE_PORT`
selects another unused provider port and must match `MLAI_E2E_MODEL_URL`.
It requires explicit fixture model environment settings. Existing listeners
cause the run to fail
rather than reuse an unknown server. Inspect the listener and its owner before
stopping anything. Production credential rate limits are unchanged; fixture
account creation uses the bounded retry helper. Retained fixture stores are
ignored by Git and may contain generated test-account credentials. Remove only
the exact finished run's directories after confirming no process uses them.

For the bounded public smoke suite on Chromium, Firefox, and WebKit, install the
reviewed Playwright browser binaries with `bunx playwright install chromium
firefox webkit`, then run `MLAI_E2E_CROSS_BROWSER=1 bun run test:e2e
tests/e2e/public-cross-browser.spec.ts`. Missing browser binaries are an explicit
unavailable gate, not permission to skip an engine silently. A 320 CSS-pixel
viewport checks narrow reflow; it is not a substitute for manual browser zoom
or assistive-technology acceptance.

Run `bun run verify:research` for the public snapshot gate. To compare with the
reviewed Sites export, add `--site-root /absolute/path/to/mlai-research-sites/public`.
The comparison checks semantic publication JSON, exact implementation JSON, and
all PDF digests against the checked-in revision receipts, without network access.
Add `--output docs/verification/research-parity-<revision>.json` to create a new
receipt containing source identity and validation hashes. Existing receipt files
are never overwritten; use a distinct name for each run. Public source links may
still require separate availability or permission checks; matching their pinned
revision syntax does not establish anonymous access.

For an unpublished presentation-only export, also supply `--site-revision`
with the exact committed 40-character canonical revision. This pins the candidate
without overwriting historical publication evidence. The receipt records both
the candidate export revision and the reviewed content revision, while requiring
unchanged research content, exact implementation bytes, and matching PDF bytes.
An empty, malformed, or mismatched revision fails. Omission retains the stricter
published-review revision comparison; it does not automatically accept a new export.

Real Agent acceptance additionally requires explicitly supplied
`MLAI_E2E_MODEL_URL` and `MLAI_E2E_MODEL_ID`. Never reuse canonical private data or
configure hosted credentials to make a local test pass. Keep model/provider
unavailability distinct from application failure.

## Activation and recovery

The clean-install gate requires explicit `MLAI_MODEL_URL` and `MLAI_MODEL_ID`
(or the matching `MLAI_LOCAL_MODEL_URL` and `MLAI_LOCAL_MODEL_ID`). It maps that
selection into the isolated setup registry and rejects conflicting, missing,
credential-bearing, or non-loopback selections. Install/setup/check commands
own detached process groups; failure cleanup must stop descendants before
removing the artifact. A success receipt is written only after the final
production server has stopped and its port is released.

The September 8 completion retry bounds CPU library threads with
`OMP_NUM_THREADS=1 MKL_NUM_THREADS=1`; this is a verification invocation setting,
not a production provider or authentication configuration change. Parser fixture
deadlines and every required format assertion remain unchanged.

Before activating a changed artifact, rerun formatting, application checks,
public and Agent browser workflows, integrations, and the clean-install gate.
Record runtime source identity and each evidence layer separately in the
implementation ledger. Back up the canonical application through its documented
backup command before an operator-approved activation; never substitute a test
store. Preserve the prior artifact for rollback, and verify web/worker ownership,
loopback health, data persistence, and the selected model after activation.

Session-independent processes are not automatically installed login services.
Auto-start installation, public publishing, standalone agent deployment, and
provider changes require separate explicit decisions. No command in the public
snapshot validator contacts a provider, imports the application database, or
fetches a remote source: it verifies the committed review manifests and PDFs.
