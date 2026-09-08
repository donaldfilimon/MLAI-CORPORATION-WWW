# Research and application improvements - 2026-09-08

## Candidate identity

The native implementation is committed at `d988a218efe747f2adf1ee073ec72ee249d69d76`.
Its runtime source digest is `dd5c90cd3257517acc88bf18cc82b10ad9072966aa3ec642c7a48b3d9a87fdca`.
Subsequent documentation and receipt changes do not change that runtime digest.
This is a verified development candidate, not an activated replacement for the
existing application on port 3100 and not a published Sites update.

## Implemented behavior

- All 31 native research entries are searchable: 21 publications, seven implementation
  studies, and three explicitly local application notes. Studies match every associated area.
- Search precedes filters in both visual and keyboard order. A short-screen test waits for
  hydration before checking the entire input is visible. The loading fallback cannot accept
  and then discard a query. URL query/filter changes preserve unrelated parameters and fragments.
- Results expose real review dates and reference-snapshot boundaries without manufacturing
  deployment status. Filter-only and combined empty states provide meaningful recovery.
- Article contents use sticky desktop navigation and mobile disclosure with unchanged
  section fragments; math/code overflow is keyboard accessible. Shared semantic colors and
  fixed heading sizes preserve the existing MLAI design rather than replace it.
- Auth headings retain word spaces on mobile; field requirements, form identity, errors,
  and busy state have explicit accessible associations. Primary navigation is named.
- Snapshot validation checks schema, identifiers, topic references, pinned source URLs,
  reviewed object/byte identity, corpus/record hashes, and PDF bytes. Twelve validator tests
  include adversarial changes, misleading moving-ref URLs, and export-parity corruption.
- Browser runs isolate data, Next output, and Next's generated TypeScript config by UUID.
  An occupied port fails closed. Agent fixtures use the existing bounded signup retry helper;
  production authentication limits are unchanged.
- Formatting-only backlog cleanup is a separate commit (`e8e936f`). CI now checks formatting
  and research evidence. The byte-pinned implementation JSON is excluded from formatting,
  not from validation. No public API or database migration was introduced.

## Verification

| Gate | Observed result |
| --- | --- |
| Full application check | Passed: shared UI declarations/typecheck, 106 TypeScript tests, 26 parser tests, production build with 64 static pages |
| Formatting and whitespace | `bun run format:check` and `git diff --check` passed |
| Final deterministic Chromium suite | 20 passed, zero skipped/unexpected/flaky, 86.1 seconds; includes confirmation, rejection, queued interpretation, source focus, late-response fencing, account, customer/staff, docs, and public routes |
| Final research/auth and cross-engine checks | 11 passed in 36.5 seconds; Chromium plus bounded Firefox/WebKit smoke |
| Research parity | Passed; `research-improvements-final-parity.json` records 6 areas, 21 publications, 7 studies, 4 PDFs and export revision `419f08b24753c024c6d40a720ea5a417d8192251` |
| Real MLX recovery | Passed at the candidate digest; `agent-live.json` records extraction, authorized citations, proposed/confirmed exactly-once project write, interpretation completion, restored requester authority/idempotency/source download/customer workflow |
| Final real MLX Agent browser | 1 passed in 23.9 seconds with no skips/flakes/errors; investigation, responsive source inspector, confirmation exactly once after refresh, cancellation |

The final deterministic machine report is `/tmp/mlai-final-deterministic.json`;
its durable summarized receipt is `research-improvements-browser.json`. Responsive screenshots are
`screenshots/research-first-viewport-{390,768,1440}.png`. Browser checks also cover
320 CSS-pixel reflow, reduced motion, invalid and combined filters, long search strings,
keyboard clearing, focus restoration, historical downloads, and deep-linked contents.

Visual browser inspection confirmed the native study search resolves the six-layer study.
The existing published Site was separately opened and its same search returned no result:
the published surface has not received these native presentation changes.

The four research text/accent tokens were numerically checked against background, panel,
and raised-panel tokens. The smallest measured ratio was 6.80:1 (muted on raised panel).
This token calculation is not a complete rendered-page accessibility certification.

## Unfinished or separately approved work

- The generated Sites checkout prohibits hand-editing exported HTML/CSS/prose. Its exporter
  belongs to the separate canonical `mlai` repository, which this application's guidance
  treats as read-only. Authorization to modify that exporter was requested, not assumed.
  No Site files, source credentials, access policy, saved version, or deployment were changed.
- Native VoiceOver announcement order, virtual-cursor modal isolation, and actual 200%/400%
  browser zoom remain manual acceptance gaps. Narrow viewport and keyboard checks are not
  substitutes. Browser zoom shortcuts were unavailable through the current UI tool.
- The changed candidate has not repeated the retained clean-install/activation gate. Existing
  prior release evidence is historical, not proof that this candidate was installed.
- Hosted CI execution, public publication, and local release activation are separate evidence
  layers. No hosted-model credentials or hosted fallback were used or configured.

An isolated development preview is available at `http://127.0.0.1:3106/research`, with
its own data/build directories. It is not an installed service. The operator-owned model
remains `http://127.0.0.1:3102/v1`, explicitly selecting
`mlx-community/Llama-3.2-3B-Instruct-4bit`. See `../LOCAL-LIFECYCLE.md` for verification,
ownership checks, and the separately approved activation/rollback procedure.
