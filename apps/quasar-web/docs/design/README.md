# Design sources

Design artifacts kept for reference. These are **sources, not shipped code** —
`docs/design-resources.md` §2 is the rule: upstream design projects feed this
site, they are not authoritative, and they are pulled in deliberately rather
than wholesale. Nothing here is imported by the app or covered by its gates.

## `console-workspace-canvas.dc.html`

The design canvas for the `/console/workspace` Files screen, exported from
Claude Design. It is the artifact the shipped screen
(`src/views/ConsoleWorkspace.tsx`) was built from — kept because the
implementation records one set of choices and this records the space they were
chosen from.

It is a Design Component: a template with `{{ … }}` interpolation plus a
`class Component extends DCLogic` block at the bottom that computes the values.
Three tweakable controls are declared in the `data-props` attribute of that
script tag and read via `this.props`; each moves many properties at once rather
than one value.

| Control | Options | Moves |
|---|---|---|
| `density` | compact · comfortable · spacious | row padding, type sizes, icon chips, nav padding, header height, grid columns, section rhythm, title size |
| `hierarchy` | flat · layered · elevated | panel fill, border strength, shadow, radius, rail and header surfaces, row dividers, card fill |
| `accent` | abi · aviva · abbey | active nav tint and rail indicator, eyebrow, filter pills, search field, mark gradient, grid hover border |

The shipped screen implements the defaults: `comfortable` / `layered` / `abi`
(cyan). An unrecognised prop value resolves to the default, and the small mono
chip under the page title echoes what actually rendered rather than what was
asked for.

Rail collapse is interactive state inside the component, not a prop — it is an
operator affordance, not a design direction.

### Rendering it

The file needs two things that are deliberately **not** vendored here:

- `support.js` — the Claude Design DC runtime. It ships no license or copyright
  header, so it is not committed into this public repository.
- `_ds/mlai-lab-design-system-…/` — the design-system bundle it links in
  `<helmet>`, about 1 MB, mostly font binaries.

Both come from the original Claude Design export. To run it, drop this file back
beside them in that bundle and open it.

Without the design-system bundle it still renders close to correct: every colour
in the template is a literal Lab value and every font stack has a system
fallback, so only Spectral / Geist / JetBrains Mono are lost. Without
`support.js` it does not render at all — the template never evaluates.

Reading it needs neither. The template and the logic block are plain source.
