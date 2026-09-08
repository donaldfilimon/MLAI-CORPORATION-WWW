# Guided candidate acceptance

Session opened: 2026-09-08. Preflight checked at 2026-09-08T12:39:27.596Z.
Status: in progress; awaiting the first operator observation. No manual pass is
inferred from the earlier automated acceptance or partial zoom observation.

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

The prior automated results are reused, not rerun or newly claimed. Browser
viewport, displayed zoom and assistive-technology behavior remain unobserved.

## Manual matrix

Each zoom cell requires a separate operator observation. Actual browser zoom
must be shown in Chrome's menu, not inferred from viewport width or CSS scaling.

| Surface and route | Chrome 200% | Chrome 400% | Safari with VoiceOver |
| --- | --- | --- | --- |
| Native `/research` | Incomplete | Incomplete | Incomplete |
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

## First operator check

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
