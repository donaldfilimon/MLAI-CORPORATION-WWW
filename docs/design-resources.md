# MLAI design & website resources — canonical index

**This repository (`MLAI-CORPORATION-WWW`) is the canonical home for MLAI's
public design and website.** Everything an external surface needs — the live
site, the shipped "Lab" design system, brand marks, and the consolidated
product/brand reference — lives here. Upstream prototypes and sibling repos
*feed* this site but are **not** authoritative; where they disagree, this repo
wins. This index exists so design/website resources don't drift across projects.

## 1 · What's canonical, and where it lives (in this repo)

| Resource | Authoritative source |
|---|---|
| **Live website** (marketing + console) | `app/` (routes/handlers) + `src/views/` (page views) — Next 15 App Router on Bun |
| **Design system / tokens** | `src/index.css` — TailwindCSS v4 tokens (OKLCH `:root` + legacy `@theme` hex), utilities (`.glass-card`, `.section-y`, `.grad-text`, `.eyebrow`, …). Narrated in `CLAUDE.md` → *Styling*. |
| **Brand identity ("Lab")** | Cyan primary `#22d3ee` · blue/sky secondary · violet/emerald/amber persona accents · near-black ink `#05070d` · **serif (Spectral)** display + Geist body + JetBrains Mono. See `CLAUDE.md` → *Brand*. |
| **Logo / wordmark** | `src/components/Logo.tsx` (node-graph mark, cyan→sky) + `public/logo.svg`, `public/mlai-mark.svg`, `public/mlai-logo-lockup.svg`, `public/favicon.svg` |
| **Hero signature** | tri-persona embedding **galaxy** + `net` constellation in `public/neural.js` (`data-neural` hosts; `mount()`/`unmount()`), mounted by `src/components/Hero.tsx` |
| **Persona legend** | `src/components/PersonaLegend.tsx` (Abbey emerald · Aviva violet · Abi cyan) |
| **Social / OG** | `public/og-image.svg`, `app/layout.tsx` (`metadataBase`, theme-color, mask-icon), `manifest.webmanifest` |
| **Site content (single source of truth)** | `src/data/categories/*` (company, products, research, blog, team, platform, services, stats, faq, industries, changelog), aggregated by `src/data/index.ts` |
| **Consolidated product/brand reference** | `docs/master-reference.md` (provenance-tagged; cross-source figures flagged) |
| **Voice & tone (written)** | `docs/voice-guidelines.md` — motto-driven voice, per-persona registers, claims discipline, do/don't from real copy. The written counterpart to this visual index. |

## 2 · Upstream / sibling resources (feed in, not canonical)

These are *sources or surfaces*, intentionally kept separate from the production site:

- **`abi` repo (Zig)** — the real WDBX/ABI runtime, MCP server, GPU/CLI. Source of
  the *backend/architecture facts* the site describes; verify repo claims there.
- **Static "bun-site" prototype** (`~/Downloads/MLAI-final-bun-site`) — an earlier
  static-export design study. Note: it carries its **own** `lib/brand.ts` and
  Sora/Manrope fonts — **prototype values, superseded** by this repo's `src/data`
  + Spectral/Geist. Do not treat its brand facts as current.
- **Claude Design project "MLAI Corporation (Template)"** — HTML mockups, films,
  OG-card canvases, and a `nextjs/` design implementation. A *design source*; the
  shipped equivalents (galaxy hero, persona legend, page templates) already live
  in this repo. Pull from it deliberately, reconciled — never wholesale.
- **Cinematic engines** — `src/film/`, `src/trailer/`, `src/mega/`, `src/explainer/`
  back the `/showcase/*` routes (lazy client chunks). These *are* in this repo.

## 3 · Standing integrity rules (apply to every downstream copy)

1. **Provenance tags** — every metric stays tagged **● measured / ○ target /
   ◆ reported**; never conflate them (see `docs/master-reference.md`).
2. **Apple framing** — only "Built on Apple's public frameworks (Metal,
   Accelerate, Core ML)." No partnership/endorsement claims.
3. **External-claims discipline** — no unbacked QPS/latency/accuracy/energy/
   security/compliance/sharding claims; frame unverified metrics as targets.
4. **AI-tooling docs stay in sync** — `CLAUDE.md` (source of truth), `AGENTS.md`,
   `GEMINI.md`, `README.md` are aligned via the `ai-tooling-sync` discipline.

## 4 · Adding or consolidating a resource here

- New brand asset → `public/` + reference it from the component that uses it; if
  it carries hardcoded hex, list it in `CLAUDE.md`'s hardcoded-hex inventory.
- New copy/figure → `src/data/categories/*` (never inline in components), tagged.
- New design doc/spec → `docs/`; mark superseded specs with a status banner.
- Re-skin → re-value tokens in `src/index.css` (both blocks) + the literal
  `cyan`/`violet`/`emerald` ramps + the hardcoded-hex list; don't restructure.
