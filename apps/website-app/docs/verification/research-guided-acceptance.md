# Guided candidate acceptance

Session opened: 2026-09-08. Preflight checked at 2026-09-08T12:39:27.596Z.
Status: incomplete; partial agent-observed native Chrome acceptance is recorded
below. Operator VoiceOver observations remain outstanding. No full manual gate
is inferred from earlier automation or a partial zoom observation.

## Verified environment and identity

- macOS 27.0, build 26A5425a.
- Installed application versions: Chrome 152.0.7977.83, Safari 27.0, VoiceOver 10.
  These came from application bundle metadata, not an observed running session.
- Native source: `a8bac5cc6fd4f0417be89076654eb07065fdf903`; runtime digest
  `fd4ea9e43941f27f98163e8102fac0b1910afc1fdf37c3f2213f1deab80406ff`.
- Native artifact: `.data/releases/mlai-clean-YTXxce`, build
  `v027-oySa7lbdvqjlLX-u`. Its 231 unchanged runtime files and the previously
  recorded generated-only tsconfig difference were reverified.
- Native preview: `http://127.0.0.1:3106`, supervisor 29242, listener 29291;
  supervisor cwd matches the retained artifact. Research returned 200.
- Site source: `2718e0cc61dfa969cb7d30ade1af1fd826652b22`; the served export
  manifest hash matches its accepted browser receipt. Research returned 200.
- Site preview: `http://127.0.0.1:3110`, listener 82616; its command serves the
  generated Site's `out` directory on loopback.
- Active port-3100 listener remains 67722. No process was changed in this session.
- Native main is clean, eight ahead; canonical main is clean, four ahead;
  generated Site main is thirteen ahead with its pre-existing `.codex/` untouched.

The bullets above describe the initial preflight, not a continuously monitored
state. The prior automated results are reused, not rerun or newly claimed.

## Manual matrix

Each zoom cell requires a separate operator observation. Actual browser zoom
must be shown in Chrome's menu, not inferred from viewport width or CSS scaling.

| Surface and route | Chrome 200% | Chrome 400% | Safari with VoiceOver |
| --- | --- | --- | --- |
| Native `/research` | Incomplete: partial observation below | Incomplete: interrupted | Incomplete |
| Site `/research/` | Incomplete | Incomplete | Incomplete |
| Native `/research/wdbx-weighted-backtrace-memory-store` | Incomplete | Incomplete | Incomplete |
| Site `/research/wdbx-weighted-backtrace-memory-store` | Incomplete | Incomplete | Incomplete |
| Native `/research/implementations/six-layer-evidence-aware-platform` | Incomplete | Incomplete | Incomplete |
| Site `/research/implementations/six-layer-evidence-aware-platform` | Incomplete | Incomplete | Incomplete |
| Native `/sign-in` | Incomplete | Incomplete | Incomplete |
| Native Agent source inspector, isolated fixture | Incomplete | Incomplete | Incomplete |

Rendered contrast for each surface remains incomplete for placeholders, focus
indicators, borders, gradients and opacity layers. Measure actual composited
colors and record the element, state, measured ratio, applicable criterion and
result; preserve any exclusion rather than treating it as a pass.

For each observation record browser/version, route, viewport, displayed zoom,
steps, expected behavior, actual outcome and screenshot/evidence reference. For
VoiceOver also record the actual announcements, reading order and focus behavior.
Use only synthetic fixture content and the explicitly selected local MLX model.
Never record fixture passwords, raw private documents or hosted credentials.

## Agent-observed Chrome follow-up (2026-09-08)

This is direct native-UI observation, not an operator report or VoiceOver pass.
The route was `http://127.0.0.1:3106/research`, serving the retained candidate
identified above. Installed Chrome version is recorded above; the running
version was not independently read from Chrome's About page.

- Passed subcheck: after resetting browser zoom and increasing it with Chrome
  shortcuts, Chrome's accessibility state explicitly displayed `Zoom: 200%`.
  This was actual browser zoom, not CSS scaling or viewport emulation.
- Passed subcheck: entering `no-such-publication-zz` produced zero articles.
  Tab focused Clear search; Enter restored 31 articles and focus to search.
  Subsequent Tab presses focused Research area and Document type in order.
- Limited visual observation: search, both selectors, result count and the
  focused selector's cyan outline were visible without observed overlap in the
  captured window. This does not establish full-page overflow or contrast.
- Evidence: native CUA accessibility output and screenshots in this task's
  conversation. No screenshot file was persisted. The image was 1301 by 768;
  this is a window image size, not a verified CSS viewport measurement.
- Incomplete: the attempt to increase zoom to 400% encountered a concurrent
  application change. The next observation showed another tab active. No 400%
  result is recorded, and no actions were sent to that unrelated tab afterward.
  The acceptance tab's final zoom and restoration to 100% remain unverified.
- Incomplete: full-page horizontal overflow, long-heading layout, all filter
  recovery combinations, remaining routes and VoiceOver behavior were not
  established by these subchecks. No reproducible product defect was found in
  the bounded search-recovery check; this is not a whole-surface approval.

No runtime source, fixture account, project, model selection or running server
was changed during this follow-up. No model request was made.

Repository/CI refresh: native `main` and `origin/main` both resolved to
`029814fe2eae313ad761609e5283c370fb984be2` before this documentation update.
The assistant did not push. Hosted runs
[34227542130](https://github.com/donaldfilimon/mlai-website-app/actions/runs/34227542130)
and [34227540152](https://github.com/donaldfilimon/mlai-website-app/actions/runs/34227540152)
were completed successfully at that revision. These runs do not establish the
outstanding manual gates or cover this subsequent documentation commit.

## Next operator check

First select only the native Research acceptance tab and reset Chrome to 100%,
visibly confirming the displayed zoom. The prior interrupted attempt did not
establish restoration. Continue only while that tab is available for acceptance.

Open native `/research` in Chrome, reset to 100%, then use Chrome's menu to set
and visibly confirm 200%. Record the viewport at 100% and at 200% using the
read-only expression `JSON.stringify({width:innerWidth,height:innerHeight})`
in an undocked DevTools console, or report viewport measurement unavailable.
Do not replace the displayed browser zoom observation with this measurement.

Using Tab, reach search, the area selector and document-type selector. Search
for `no-such-publication-zz`; reach Clear search with Tab and activate it with
Enter. Confirm focus returns to search and 31 results return. Check that headings,
labels and controls do not overlap or clip and that the page has no horizontal
scrolling. Report what actually happened, including any unreachable control.
Capture the page and displayed 200% zoom without unrelated private tabs/content.
Restore 100% after recording this check.

## Release status

Manual acceptance remains incomplete. Publication-ready and activation-ready
remain false. No push, publication, activation, DNS, login-service or provider
change is authorized by this session. Candidate and previous release artifacts
remain preserved. Later observations will be appended without rewriting earlier
results or substituting automation for operator acceptance.
