# MLAI website redesign — gap analysis

**Target:** `donaldfilimon/mlai-website-app` (Next 16, Bun, `@mlai/ui`)
**Handoff:** `/workspace/mlai-website-attach/design_handoff_mlai_app_and_site/` (written for `MLAI-CORPORATION-WWW`; paths adapted below)
**Date:** 2026-09-06 (ET)
**Constraints:** Abbey brand → IWL where product naming applies; never invent metrics; figures only from existing brand sources; prefer existing `@mlai/ui` tokens (`--cyan` / `--purple` / `--green`, Sora/Manrope/JetBrains Mono).

## Route map (Site*.dc.html → app)

| Design file | Intended IA | Existing route / surface | Status | Notes |
|---|---|---|---|---|
| `Site Home.dc.html` | `/` marketing home | `src/app/(public)/page.tsx` | Partial | Different thesis (inspectable vs never phones home); has ArchitectureDiagram + product rows; missing AccentGlow, HeroBench, StatBlock grid, PersonaCard, SplitSection, NextUp, ProvLegend |
| `SiteNav.dc.html` | sticky site chrome | `packages/ui/src/public-nav.tsx` + `src/components/public-nav.tsx` | Partial | Current defaults: Architecture / Products / Research / Docs / Company + Sign in / Open workspace. Design: WDBX · ABI · Abbey · Platform · Research · Company · Investors · Docs · Console + Contact CTA |
| `SiteFooter.dc.html` | site footer | `src/app/(public)/layout.tsx` `.public-footer` | Partial | Flat link row; missing gradient hairline, Products/Company/External columns, ProvLegend strip, Delaware/Orlando legal line |
| `Site WDBX.dc.html` | `/wdbx` | `src/content/pages.ts` → `/(public)/[...slug]` | Partial | Article layout exists; not design sections (hero stats, feature grid, DataTable, SplitSection) |
| `Site ABI.dc.html` | `/abi` | same | Partial | Article layout; no StatBlocks / StepList pipeline / Callout integrity note |
| `Site Abbey.dc.html` | `/abbey` (IWL brand) | `AbbeyPage` + pages.ts | In progress | Composed marketing page (IWL product naming, personas, registers, shipping). No unsourced eval metrics. |
| `Site Platform.dc.html` | `/platform` | `PlatformPage` + pages.ts | In progress | Four layers, refusals, audience, FAQ, NextUp. Illustrative trace only. |
| `Site Research.dc.html` | `/research` | `src/components/research-pages.tsx` + `src/content/research.ts` | Partial | Research landing + publications exist; missing design PublicationIndex / SpecList / provenance callouts |
| `Site Investors.dc.html` | `/investors` | `pages.investors` | Partial | Conservative evidence-before-projections article — do not paste design TAM/$1.5M figures unless sourced in-repo brand data |
| `Site Company.dc.html` | `/company` | `pages.company` | Partial | Article layout vs design FeatureCard/DataTable/SplitSection |
| `Site Contact.dc.html` | `/contact` | dedicated branch in `[...slug]/page.tsx` + `ContactForm` | Partial | Form exists; missing design AccentGlow / Callout framing |
| `Site Docs.dc.html` | `/docs` (+ shell) | `/docs` ContentIndex + `docs/*` articles | Partial | Searchable index exists; missing sticky 230px sidebar + Cmd-K palette DocsShell |
| `Site Console.dc.html` | marketing gate + workspace | `/app` + `/sign-in` | Different | Better Auth sign-in + workspace console are product UI, not the design two-up marketing gate |
| `Mobile App.dc.html` | Expo companion | out of scope for this Next app | N/A | Handoff mobile TSX targets a different surface |

### Extra app routes (no Site*.dc.html)

| Route | Role |
|---|---|
| `/architecture` | Editorial architecture (DocumentFlow) — keep; design folds some into Platform/Home |
| `/services` | Services page — keep; not in SiteNav design |
| `/privacy`, `/terms`, `/processing` | Legal — keep in footer |
| `/sign-in`, `/sign-up` | Auth |
| `/app/**` | Authenticated Abbey/console/portal |

### Missing pages vs design IA

- No dedicated Docs shell route group (sidebar + Cmd-K). Content exists as flat articles.
- No public Console marketing gate page separate from `/sign-in` + `/app`.
- Investors exists but is intentionally non-numeric vs design deck.
- Product deep-links WDBX / ABI / Abbey exist but are prose articles, not design system compositions.

## `@mlai/ui` component coverage

| Design (MlaiLab.*) | In `@mlai/ui` today | Gap |
|---|---|---|
| LogoMark / Brand | `Brand` | Mark path OK; size variants optional |
| SiteNav | `PublicNav` | Link set + Contact CTA + sticky blur fidelity |
| SiteFooter | layout-only CSS | Need PublicFooter (or layout markup) with columns |
| AccentGlow, Section, SplitSection, FeatureCard, StatBlock, PersonaCard, HeroBench, NextUp, ProvLegend, SpecList, StepList, DataTable, Callout, FAQList, Glossary, PublicationIndex, Button/Input/Textarea | — | Missing as shared primitives. Closest: ArchitectureDiagram, DocumentFlow, ContentIndex, AuthForm, ContactForm, CSS .button / .eyeline |

App already ships CSS utilities: `.button`, `.eyeline`, product accent classes (`.wdbx` / `.abi` / `.abbey`), `.public-header`, `.public-footer`.

## shadcn status

- `packages/ui/components.json` present (new-york / CSS variables).
- Primitives added under `packages/ui/src/components/ui/*` and re-exported from `@mlai/ui` without removing Brand/PublicNav/forms/architecture.
- Lab tokens map shadcn vars (`--primary` → `--cyan`, panels → `--panel` / `--panel-raised`).
- Imports use relative paths so the esbuild no-bundle build stays valid; local `src/lib/utils.ts` (`clsx` + `tailwind-merge`) replaces the registry `cn` package name.

## Fidelity priorities (ship order)

1. Chrome: SiteNav + SiteFooter toward design (this slice).
2. Home: hero/eyebrow/CTAs + three-layer stack cards; no inventing StatBlock numbers.
3. Product pages as composed FeatureCard sections using existing copy from pages.ts / research.
4. Docs shell + Cmd-K.
5. Console marketing gate only if product wants a public pitch page distinct from `/sign-in`.

## Brand / claims

- Abbey marketing surfaces: use **IWL** naming when replacing Abbey product label (per brand direction); keep Abbey as assistant persona where appropriate.
- Investors / Home stats from handoff (295×, 0.8ms, $1.5M, TAM tables) are not present as verified brand modules in this repo — leave out until a brand provenance module exists.
- Existing app copy already enforces evidence before projections on `/investors`.

## First redesign slice (this PR)

- Align PublicNav default items + Contact primary CTA with SiteNav (keep Sign in / workspace secondary).
- Restyle sticky header (blur, mono uppercase links) via `@mlai/ui` CSS tokens.
- Expand public footer toward SiteFooter columns without dropping privacy/terms.
- Nudge Home hero/stack copy toward Site Home privacy-first thesis without adding unsourced metrics.
