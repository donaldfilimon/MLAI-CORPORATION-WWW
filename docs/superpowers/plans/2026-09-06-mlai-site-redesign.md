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
- [ ] Commit message if needed: `style(ui): remap Lab tokens to handoff cyan/purple/emerald + Spectral/Geist`

---

## Task 2: shadcn init in `packages/ui` (non-breaking)

**Deliverable:** `components.json` + first components under `src/components/ui/*`; `@mlai/ui` existing exports unchanged.

- [x] `cd packages/ui && bunx shadcn@latest init` (map CSS vars onto existing tokens).
- [x] `bunx shadcn@latest add button card separator badge navigation-menu sheet dialog command table input textarea`
- [x] Re-export selectively from `packages/ui/src/index.ts` only what product pages need.
- [ ] `bun run build:ui && bun run typecheck`
- [ ] Commit: `chore(ui): init shadcn primitives mapped to Lab tokens`

---

## Task 3: Platform + Abbey + ABI + WDBX composed pages

**Deliverable:** Product routes use FeatureCard/section layouts from existing copy; Abbey shows IWL where product-named.

- [x] Read `src/content/pages.ts` for abbey/abi/wdbx/platform bodies.
- [x] Add shared section primitives (FeatureCard / SplitSection-style) in `@mlai/ui` or app components — **no StatBlocks with invent numbers**.
- [x] Update `[...slug]` or dedicated routes to render composed sections.
- [x] Abbey: IWL in hero/eyebrow only; Research claims gate.
- [ ] `bun run typecheck` + spot-check `bun run dev` on `/platform` `/abbey` `/abi` `/wdbx`
- [ ] Commit + PR: `feat(site): compose Platform/Abbey/ABI/WDBX toward handoff`

---

## Task 4: Docs shell + Cmd-K

**Deliverable:** Sticky sidebar docs IA + command palette over existing docs articles.

- [x] Scaffold DocsShell (230px sidebar + content column) around `src/app/docs`.
- [x] Wire `command` + `dialog` for ⌘K/Ctrl+K search over doc titles.
- [x] Empty state copy may reference recall metaphor without fake scores unless branded.
- [ ] Playwright smoke optional; typecheck required.
- [ ] Commit + PR: `feat(docs): sidebar shell + command palette`

---

## Task 5: Research / Company / Contact / Investors polish

**Deliverable:** Design framing without numeric invention.

- [x] Research: PublicationIndex-style list from `src/content/research.ts` only.
- [x] Investors: keep evidence-before-projections; reject handoff TAM/$1.5M until provenance.
- [x] Contact: AccentGlow/Callout framing around existing ContactForm.
- [ ] Commit + PR per page group if large.

---

## Task 6: Deferred / out of scope (track only)

- [ ] Agent-view hardcoded green hex cleanup.
- [ ] Public Console marketing gate distinct from `/sign-in` (product decision).
- [ ] Mobile Expo Chat/onboarding/WDBX console (separate app).
- [ ] Brand provenance module unlocking StatBlocks.

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
