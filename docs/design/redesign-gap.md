# MLAI website redesign — gap analysis

**Target:** `donaldfilimon/mlai-website-app` (Next 16, Bun, `@mlai/ui`)
**Updated:** 2026-09-07 (ET) — closeout refresh after PRs #1–#9 + `8560e6b`
**Constraints:** IWL only on Abbey / ABI / Abbey Bot product surfaces; never IWL on Quesar; never invent metrics; StatBlocks / figure tables only from `src/content/provenance.ts` `figures` (sourced rows). Home Benchmarks grids stay dark until a published harness.

## Route map (Site*.dc.html → app)

| Design file | Intended IA | Existing route / surface | Status | Notes |
|---|---|---|---|---|
| `Site Home.dc.html` | `/` marketing home | `src/app/(public)/page.tsx` | Shipped (claim-safe) | Privacy-first thesis, stack cards, architecture flow, research teaser. No handoff Benchmarks / StatBlock grids. Optional ProvLegend only. |
| `SiteNav.dc.html` | sticky site chrome | `packages/ui/src/public-nav.tsx` + `src/components/public-nav.tsx` | Shipped | WDBX · ABI · IWL · Platform · Research · Company · Investors · Docs + Sign in / Console + Contact CTA. No separate Console marketing gate. |
| `SiteFooter.dc.html` | site footer | `src/app/(public)/layout.tsx` | Shipped | Gradient hairline; Products / Company / External columns; ProvLegend strip; Delaware C-Corp · Orlando legal line; privacy/terms retained. |
| `Site WDBX.dc.html` | `/wdbx` | `WdbxPage` + pages.ts | Shipped | Composed sections + sourced `figures` (wdbx accent) with ProvTag / ProvLegend. |
| `Site ABI.dc.html` | `/abi` | `AbiPage` + pages.ts | Shipped | Composed sections + sourced `figures` (abi accent) with ProvTag / ProvLegend. |
| `Site Abbey.dc.html` | `/abbey` (IWL brand) | `AbbeyPage` + pages.ts | Shipped | IWL product naming; personas/registers; no unsourced eval metrics. |
| `Site Platform.dc.html` | `/platform` | `PlatformPage` + pages.ts | Shipped | Layers, refusals, audience, FAQ, NextUp. Illustrative trace only. |
| `Site Research.dc.html` | `/research` | `ResearchLanding` + `src/content/research.ts` | Shipped | Tracks, index, formal model, glossary. No invented StatBlocks. |
| `Site Investors.dc.html` | `/investors` | `InvestorsPage` | Shipped | Figure-free thesis + open-core facts. No TAM / $1.5M. |
| `Site Company.dc.html` | `/company` | `CompanyPage` | Shipped | Founder split, principles, Delaware/Orlando facts, hiring, NextUp. |
| `Site Contact.dc.html` | `/contact` | `ContactPage` + ContactForm | Shipped | Two-up layout, privacy callout, wired form. |
| (Next handoff) | `/quesar`, `/quesar/consent`, `/quesar/audit` | Quesar* + `src/content/quesar.ts` | Shipped (mock) | Private-ops narrative; localStorage consent labelled; noindex consent/audit; **no IWL**; no StatBlocks. |
| (Next handoff) | `/knowledge` | `KnowledgePage` | Shipped | Motto, personas, invariant, glossary; no StatBlocks. |
| (Next handoff) | `/repositories` | `RepositoriesPage` | Shipped | Per-repo Current/Partial/Proposed/Not claimed ledger. |
| (Research) | provenance module | `src/content/provenance.ts` + `ProvTag` / `ProvLegend` | Shipped | ● measured / ○ target / ◆ reported; `figures` populated with sourced HNSW/WAL/router rows; banned handoff list retained. |
| `Site Docs.dc.html` | `/docs` (+ shell) | DocsShell + Cmd-K | Shipped | Sticky sidebar + command palette over existing articles. |
| `Site Console.dc.html` | marketing gate + workspace | `/app` + `/sign-in` | Parked | Product UI is auth + workspace — **not** a public two-up Console marketing gate. Do not invent one. |
| `Mobile App.dc.html` | Expo companion | out of scope | N/A | Separate surface. |

### Extra app routes (no Site*.dc.html)

| Route | Role |
|---|---|
| `/architecture` | Editorial architecture (DocumentFlow) |
| `/services` | Services |
| `/privacy`, `/terms`, `/processing` | Legal |
| `/sign-in`, `/sign-up` | Auth |
| `/app/**` | Authenticated Abbey / console / portal |

## `@mlai/ui` + app chrome

| Design (MlaiLab.*) | Status |
|---|---|
| LogoMark / Brand | Shipped |
| SiteNav (`PublicNav`) | Shipped (design link set + Contact CTA) |
| SiteFooter | Shipped in public layout (columns + ProvLegend + legal) |
| ProvTag / ProvLegend | Shipped in app (`src/components/prov-tag.tsx`) |
| AccentGlow / FeatureCard / SplitSection / etc. | Partially composed on product pages; not a second design system |
| Home Benchmarks / handoff StatBlock grids | **Blocked** until harness + new sourced `figures` rows |

shadcn primitives under `packages/ui/src/components/ui/*` mapped to Lab tokens; existing Brand/PublicNav/forms kept.

## Brand / claims

- **IWL** only on Abbey / ABI / Abbey Bot product surfaces.
- **Quesar** = private AI ops — never IWL.
- Investors / public Home stay non-numeric for banned deck figures (295×, 0.8ms, $1.5M, TAM, unsourced QPS).
- Sourced rows in `figures` may render with ProvTag (as on `/wdbx` and `/abi`). Empty or “—” target rows stay honest.

## Remaining (honest)

1. **Parked — product decision:** public Console marketing gate distinct from `/sign-in` + `/app`.
2. **Parked — out of scope:** Mobile Expo companion; agent-runtime / abbey-completion Tasks 1–3.
3. **Parked — do not merge:** nested `mlai-web` scaffold (`claude/filimon-audit-web-stack-nqgaf9` / PR #10 lineage).
4. **Blocked on harness:** Home Benchmarks grids and any handoff StatBlock numbers not in `figures` with real `source`.
5. **Optional polish:** further visual fidelity vs Site*.dc.html (glow, PersonaCard density) without new claims.

## Closeout slice (this PR)

- Refresh this gap map to shipped reality.
- Tick verified plan boxes for chrome/docs closeout.
- Footer: External column label + ProvLegend strip + Delaware/Orlando legal line.
- Home: light composition tighten + optional ProvLegend only (no Benchmarks grid).
- Nav already aligned — leave Console → `/app` (no new marketing gate).
