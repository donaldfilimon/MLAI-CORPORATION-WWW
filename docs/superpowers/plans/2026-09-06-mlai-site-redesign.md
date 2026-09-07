# MLAI website redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `mlai-website-app` public marketing surfaces to handoff fidelity (Site*.dc.html) using `@mlai/ui` + optional shadcn primitives, without inventing metrics.

**Architecture:** Adapt the design_handoff bundle (written for MLAI-CORPORATION-WWW) onto this Next 16 / Bun / `@mlai/ui` app. Land Lab tokens first, then compose product/docs pages from existing `pages.ts` / research content. Authenticated `/app` stays product UI.

**Tech Stack:** Next.js 16 App Router, React 19, Bun 1.4 workspaces, `@mlai/ui`, optional shadcn under `packages/ui/src/components/ui/*`, Vitest + Playwright.

## Global Constraints

- Abbey product naming may use **Intelligence Without Limits (IWL)**; keep IWL off console / Quesar-adjacent surfaces.
- Never invent metrics (no 295× / 0.8ms / $1.5M / QPS / “fastest”) until an in-repo brand provenance module exists.
- Prefer semantic tokens (`--bg`, `--panel`, `--cyan`, `--purple`, `--green`); Lab remap commit `a3ffc7a` must land on `main` before page polish.
- Do not commit `.env.local`. Mobile Expo handoff is out of scope for this plan.
- Leave hardcoded agent-view greens for a dedicated follow-up (do not block marketing pages).

---

## File map

| Path | Responsibility |
|---|---|
| `packages/ui/src/styles/tokens.css`, `tokens.ts` | Lab handoff colors + Spectral/Geist/Mono |
| `packages/ui/src/public-nav.tsx`, `src/components/public-nav.tsx` | SiteNav fidelity |
| `src/app/(public)/layout.tsx` | SiteFooter columns + legal |
| `src/app/(public)/page.tsx` | Home composition |
| `src/content/pages.ts` + `[...slug]` | Product/company/contact articles → sectioned layouts |
| `src/app/docs/**` | Docs shell + Cmd-K |
| `packages/ui/src/components/ui/*` | Optional shadcn primitives |
| `docs/design/redesign-gap.md` | Living gap map |

---

## Task 1: Land Lab token remap on main

**Deliverable:** `a3ffc7a` (or equivalent) merged to `main`.

- [x] Confirm `git merge-base --is-ancestor a3ffc7a origin/main` fails today.
- [x] Branch `redesign/lab-tokens` from `origin/main`; cherry-pick `a3ffc7a` (or reopen tip of `redesign/site-chrome-home-slice` commits after merge).
- [x] `bun run build:ui && bun run typecheck`
- [x] Open PR → merge.
- [x] Commit message if needed: `style(ui): remap Lab tokens to handoff cyan/purple/emerald + Spectral/Geist`

---

## Task 2: shadcn init in `packages/ui` (non-breaking)

**Deliverable:** `components.json` + first components under `src/components/ui/*`; `@mlai/ui` existing exports unchanged.

- [x] `cd packages/ui && bunx shadcn@latest init` (map CSS vars onto existing tokens).
- [x] `bunx shadcn@latest add button card separator badge navigation-menu sheet dialog command table input textarea`
- [x] Re-export selectively from `packages/ui/src/index.ts` only what product pages need.
- [x] `bun run build:ui && bun run typecheck`
- [x] Commit: `chore(ui): init shadcn primitives mapped to Lab tokens`

---

## Task 3: Platform + Abbey + ABI + WDBX composed pages

**Deliverable:** Product routes use FeatureCard/section layouts from existing copy; Abbey shows IWL where product-named.

- [x] Read `src/content/pages.ts` for abbey/abi/wdbx/platform bodies.
- [x] Add shared section primitives (FeatureCard / SplitSection-style) in `@mlai/ui` or app components — **no StatBlocks with invent numbers**.
- [x] Update `[...slug]` or dedicated routes to render composed sections.
- [x] Abbey: IWL in hero/eyebrow only; Research claims gate.
- [x] `bun run typecheck` + spot-check `bun run dev` on `/platform` `/abbey` `/abi` `/wdbx`
- [x] Commit + PR: `feat(site): compose Platform/Abbey/ABI/WDBX toward handoff`

---

## Task 4: Docs shell + Cmd-K

**Deliverable:** Sticky sidebar docs IA + command palette over existing docs articles.

- [x] Scaffold DocsShell (230px sidebar + content column) around `src/app/docs`.
- [x] Wire `command` + `dialog` for ⌘K/Ctrl+K search over doc titles.
- [x] Empty state copy may reference recall metaphor without fake scores unless branded.
- [x] Playwright smoke optional; typecheck required.
- [x] Commit + PR: `feat(docs): sidebar shell + command palette`

---

## Task 5: Research / Company / Contact / Investors polish

**Deliverable:** Design framing without numeric invention.

- [x] Research: PublicationIndex-style list from `src/content/research.ts` only.
- [x] Investors: keep evidence-before-projections; reject handoff TAM/$1.5M until provenance.
- [x] Contact: AccentGlow/Callout framing around existing ContactForm.
- [x] Commit + PR per page group if large.

---

## Task 6: Deferred / out of scope (track only)

- [x] Agent-view hardcoded green hex cleanup (shipped on earlier branch / main).
- [ ] Public Console marketing gate distinct from `/sign-in` (product decision — parked).
- [ ] Mobile Expo Chat/onboarding/WDBX console (separate app — parked).
- [x] Brand provenance module (`src/content/provenance.ts` + ProvTag/ProvLegend); sourced `figures` render on `/wdbx` + `/abi`. Home Benchmarks grids still blocked until harness.

---

## Verification

```sh
bun install --frozen-lockfile
bun run build:ui
bun run typecheck
bun run test
# optional: bun run test:e2e
```

Chrome-devtools visual QA on `:3100` for Home/nav/product pages after each PR.

## Owners

| Slice | Primary | Review |
|---|---|---|
| Tokens / shadcn | Abbey + Architecture | Architecture |
| Claims / IWL copy | Research | Research |
| Product/docs pages | Abbey | Architecture + Research |

---

## Task 7: Chrome / home closeout (this PR)

**Deliverable:** Gap map honest; footer ProvLegend + legal; home claim-safe; no Console gate; no banned grids.

- [x] Refresh `docs/design/redesign-gap.md` to shipped reality (Remaining only parked/blocked items).
- [x] PublicNav link set already design-aligned — keep Sign in / Console → `/app` / Contact CTA (no new Console marketing page).
- [x] Footer: Products / Company / External columns + ProvLegend strip + Delaware C-Corp · Orlando legal line.
- [x] Home: light composition tighten + optional ProvLegend only — **no** handoff Benchmarks / StatBlock grids.
- [x] `bun run check` (or typecheck + tests + build); fix regressions from this slice.
- [x] Commit + PR: `feat(site): redesign closeout — chrome, gap map, ProvLegend footer`
