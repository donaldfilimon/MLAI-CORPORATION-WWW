# Research and release preparation completion

## Candidate identities

- Native runtime source: `a8bac5cc6fd4f0417be89076654eb07065fdf903`, SHA-256
  `fd4ea9e43941f27f98163e8102fac0b1910afc1fdf37c3f2213f1deab80406ff`.
- Canonical Research exporter: `2718e0cc61dfa969cb7d30ade1af1fd826652b22`.
- Generated Site: `a45d20f` on its canonical local main branch (candidate
  implementation and generated assets committed in `3661c44`).
- Published Site remains version 2, confirmed through hosted metadata. No save,
  push, publication, activation, access-policy change or hosted-model configuration
  was performed in this completion pass.

## Changes and evidence

The Site now searches all 28 shared records, including all study topic memberships,
preserves URL state/history and legacy filters, exposes honest evidence metadata,
and provides desktop/mobile contents and keyboard-operable equation overflow.
The historical tag constraint is explicitly visible, including unknown values.
Publication prose, study records and PDF bytes did not change.

Native parity accepts a separately pinned candidate export revision without
rewriting the historical published-review manifest. Thirteen validator tests
cover explicit empty/mismatched revisions, content corruption and missing or
corrupted attachments. The final parity receipt records both export and reviewed
content revisions; three native-only notes are not part of Site parity.

Site packaging verifies the clean manifest, exact inventory and every byte hash
before and after copying to output. It no longer reintroduces the obsolete filter
controller or repairs its manifest hash. Eleven packaging/filter tests passed.
The Site browser receipt records nine passing engine/width combinations across
Chromium, Firefox and WebKit at 390/768/1440, with no JavaScript errors or HTTP
asset failures. Source and harness hashes bind the receipt. Final canonical
Research tests: 365 passed across 41 files. The 104-page production build passed
on the final canonical revision, including the legacy-tag fix.

Rendered contrast review found native footer text at 4.23:1 and repaired it with
the existing muted token. The focused browser regression passed. The final
computed solid-background text check found no measured failures: minimum 6.26:1
on native Research and 7.85:1 on the Site. See `research-completion-contrast.json`
for sampling and excluded gradient/opacity layers, placeholders and borders.

Clean-install timeout testing exposed surviving parser grandchildren after the
verifier deleted their installation. Install/setup/check now own detached process
groups, terminate descendants before cleanup, and retain artifacts if cleanup
cannot be confirmed. Success receipts are written only after final production
shutdown. Nine focused regression tests passed. The selected loopback model is
mapped into the isolated setup registry; missing/conflicting/non-loopback choices
fail instead of silently creating the default 8080 connection.

## Acceptance ledger

Final retained clean-install passed against the runtime source above. Its fresh
copy passed frozen installation, all 23 advertised document formats, 116 unit
tests across 12 suites, 26 parser tests, shared-UI compilation/declarations,
strict TypeScript and the 64-page production build. Development rebuilt the UI;
production account/project creation, restart persistence, unauthenticated access
protection, process-tree shutdown and port release all passed. The retained
artifact is `.data/releases/mlai-clean-YTXxce`; its synthetic data must not be
used for activation. This is an installed local candidate, not an offline bundle.

Final deterministic Chromium acceptance passed 21/21 in 75.4 seconds. Focused
native research/auth acceptance passed 11/11 in 26.6 seconds, including Firefox
and WebKit smoke checks. Both runs had no skipped, unexpected or flaky tests.
The 15 retained native screenshots cover collection, studies, articles and Agent
source inspection; mobile/desktop collection screenshots were visually inspected.

Real MLX integration and recovery passed, including grounded streaming, resolved
citations, cancellation, restored customer/AI workflows, complete source deletion,
WDBX TLS/mTLS, bounded timeout and disconnection. Separate Agent acceptance passed
proposal-before-write, confirmed exactly-once creation, interpretation completion,
restored pending proposals, requester authorization and idempotency. The final
real-model browser flow passed 1/1 in 21.7 seconds, including source inspection at
390/768/1440, explicit confirmation, refresh persistence and cancellation.
These three recovery/installation receipts share the exact runtime digest above.

Durable receipts are `research-completion-clean-install.json`,
`research-completion-integrations.json`, `research-completion-agent.json`,
`research-completion-source-parity.json` and `research-completion-acceptance.json`.
Candidate screenshots were in `research-completion-screenshots/`; they were removed from the
tree on 2026-09-16 and remain in git history (present through `fe41894`). The prior generic
receipts and historical screenshots were preserved after capturing the new results.

Artifact build ID: `v027-oySa7lbdvqjlLX-u`; Bun lock SHA-256:
`235ae89a80b4186f364d953ad3daefe2cdd1f67d37cd6f2b325c5bcc609212ff`.
Of 232 runtime source files, 231 remained byte-identical in the retained artifact.
Next.js reformatted `tsconfig.json` and added only `.next-development/types/**/*.ts`
and `.next-development/dev/types/**/*.ts`; its parsed remainder matched source.
Observed tools were Node 26.8.1, Bun 1.4.3-canary.1 and Python 3.13.14; this is not
evidence of execution under the repository's exact Node 24/Bun 1.4.0 pins.

Two rejected browser attempts are retained in temporary diagnostics: the first
had a cold-page navigation timeout and a delayed document search; the second
encountered a concurrent shared-UI rebuild removing `tokens.css`, causing real
HTTP 500s. The successful account flow in the second run refuted the initial
sign-out defect hypothesis. No production throttling or test assertions were
weakened. Build and browser gates must run serially in one checkout.

The initial clean setup hit its deadline during OCR; it was rejected. The next
attempt passed setup but failed 22 unit tests because the clean-install registry
override escaped into tests with their own data directories. The verifier now
removes only that override for `bun run check`, preserving explicit model
selection and the isolated registry for setup and application servers. The retry
uses `OMP_NUM_THREADS=1 MKL_NUM_THREADS=1` and retains every parser fixture and
deadline. Dependencies and model caches are reused where present; fresh OCR
assets are downloaded by the existing synthetic-fixture setup, not hosted inference.
The following attempt passed 115 unit tests, all parser tests and the complete
production build, but its cleanup received macOS `EPERM` while probing an exited
group. That artifact was retained and the run rejected. The shared cleanup helper
now corroborates absence with a successful numeric process-group table read;
existing groups and failed inspection still block success and retain the artifact.

## Manual gates and approvals

The guided follow-up is tracked in `research-guided-acceptance.md`. Its refreshed
identity and ownership preflight passed; partial agent-observed Chrome results
are recorded separately from the outstanding operator observations.
No outstanding manual gate is closed merely by opening that session.

Actual Chrome 200% zoom was observed on native Research with readable reflow.
The follow-up also verified keyboard Clear search recovery from zero to 31
articles, focus restoration to search, and tab order to both filter selectors.
Full-page overflow and exact CSS viewport dimensions remain unverified. Evidence
is in the task's native-UI outputs; no new screenshot file was persisted.
Native 400%, Site 200%/400%, and VoiceOver announcement order/modal isolation are
not verified. A concurrent tab change interrupted the latest 400% attempt;
the acceptance tab's final zoom and restoration to 100% remain unverified.
No unsupported automation result is called a manual pass.

Operator check required: on the isolated candidate, verify 200%/400% browser zoom
for collection, article contents/equations and sign-in, then use VoiceOver to
check headings/reading order, search-result announcements, keyboard recovery,
and Agent source-inspector virtual-cursor containment and focus restoration.
Record the exact candidate, browser/assistive-technology version and outcomes.
These unresolved manual gates block both publication and activation readiness.
Computed contrast results do not close the remaining manual review of gradients,
opacity, placeholder text, borders and pseudo-elements.

The initial completion checked hosted CI only at `b787f27`. A subsequent
read-only refresh found native `main` and `origin/main` at `029814f`, with
[run 34227542130](https://github.com/donaldfilimon/mlai-website-app/actions/runs/34227542130)
and [run 34227540152](https://github.com/donaldfilimon/mlai-website-app/actions/runs/34227540152)
both successful at that revision. The assistant did not perform that push.
These hosted results do not close manual acceptance or cover the later evidence
documentation update. No public Site publication was performed by this session.
GitHub Pages is configured to publish the native repository's `main:/docs`;
therefore even a documentation push has publication effects and remains withheld
by this session. Remote movement alone does not establish the Site's live version.
The canonical MLAI deployment branch likewise requires public-rollout approval.

The active local application on port 3100 remains unchanged and healthy; its
listener was still PID 67722. Previous local release artifacts remain available.
The Site rollback is unchanged published version 2 and local commit `842f3a5`.
Candidate and previous Site archives are retained under private
`.data/research-completion-20260908/`; their SHA-256 values are:

- Candidate: `095cd06129197077c050660016022b93bc5826808cd24c6a9e7cd7e0252657f7`.
- Previous public export: `5ae584179b3e5142b8e698dc7e0c86049fe1bf145197028c20cb15ba71d0790e`.

Publication and local activation require separate later approvals and passing
manual gates. Neither the unpublished Site preview on port 3110 nor the isolated
native preview on port 3106 is an activation or installed login service.

The final handoff probe found that the older port-3106 development preview still
cached the earlier missing-`tokens.css` error. After confirming its recorded
supervisor PID 28551, process group, cwd and listener ownership, only that preview
was stopped. Port 3106 now serves the retained `mlai-clean-YTXxce` production
artifact under supervisor PID 29242, with the same isolated
`.data/research-preview-20260908` data and explicit MLX registry. Research and
sign-in return 200; health reports local/SQLite mode. Private process state and
logs remain in that preview directory. Port 3100 remains unchanged at PID 67722.
This preview uses neither the artifact's synthetic clean-install database nor
canonical live data, and does not depend on mutable shared development output.

## Proposed targets and recovery

These are later operator-approved actions, not commands executed in this pass.

The proposed Site target is project `appgprj_6a9d484ec5a881919dc02a7a3ee7934e`
at `https://mlai-research-review.underswitch.chatgpt.site`, using only the verified
`mlai-research-sites/out` export. Recheck the export manifest and hosted version
before a version save/publication. Keep version 2 available; a rollback selects
that previous version, rather than regenerating old content from newer sources.
The previous local public export and its archive provide an additional reference.

The proposed local target remains `http://127.0.0.1:3100` with canonical
`/Users/donaldfilimon/dev/active/mlai-website-app/.data`, never the candidate's
synthetic acceptance database. The exact retained candidate is recorded in
`research-completion-clean-install.json`. Before activation, verify its runtime digest and
build ID, all required acceptance, the existing listener's current process tree,
and the selected `http://127.0.0.1:3102/v1` model. Back up canonical data with
`MLAI_DATA_DIR=/Users/donaldfilimon/dev/active/mlai-website-app/.data bun run backup`
to a new private destination. Stop only the verified old web/worker supervisor;
launch `bun start` from the accepted artifact with `APP_URL=http://127.0.0.1:3100`
and that canonical data directory. Preserve the existing operator connection
registry and MLX process. Recheck health, authentication, persistence and both
owned web/worker processes before calling activation successful.

For a code-only rollback, stop only the new verified process tree and restart
the retained `mlai-clean-bKPz2X` artifact with the same canonical configuration.
If data recovery is required, run `bun run restore BACKUP_DIRECTORY NEW_DATA_DIRECTORY`
into a new destination, validate it on an unused loopback port, and obtain approval
before switching the active data path. Never overwrite live data with fixtures
or a restore, and do not install login services as part of either procedure.
