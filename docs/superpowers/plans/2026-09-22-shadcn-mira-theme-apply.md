# 2026-09-22-shadcn-mira-theme-apply

Apply shadcn preset b6VP9Bgmwr (mira style + cyan + olive base + ibm-plex-sans/space-grotesk + phosphor) to entire monorepo while preserving "Quesar by MLAI" Lab aesthetic exactly (cyan #22d3ee primary on #05070d ink, Spectral display + Geist sans, heavy .glass-card/.grad-text, semantic OKLCH + persona accents wdbx/cyan abi/violet abbey/emerald, glassmorphism). Primary surface: apps/mlai (Next 16/React 19/Tailwind v4 + custom @mlai/design-tokens + ui/site components).

Current: components.json "base-nova"/neutral/lucide. 39+ lucide direct imports. Raw hex + Tailwind color classes + inline styles scattered across views, site/, design boards, cinematic, console, research css, static site/.

**Requirements (from user directive + AGENTS.md + inspected state)**
- Run exact `bunx --bun shadcn@latest apply --preset b6VP9Bgmwr` (cd apps/mlai).
- Reconcile (do NOT lose Lab signature, serif, glass, persona, near-black ink).
- Audit + update **every** file (app/, views/*, components/{ui,site}/*, css, tokens, og/design/cinematic/console scripts, public svgs, site/*.html, research assets, etc.). Replace raw hex with semantic theme tokens.
- Propagate fonts/radius/menu/icons.
- Update components.json + deps (phosphor) + regen.
- Fix breakage (layout, Navbar, cards glass variant, buttons, forms, showcases).
- Full gates + design-sync + og + crawl.
- Finish all (no open items); document in CLAUDE/AGENTS/GEMINI if needed.
- PR-ready on canonical default branch.
- Respect: one Next app, bun only, root lockfile, check gates, site/ over raw, provenance, no public route breaks.

**Global Constraints**
- Canonical checkout + default branch only (no worktree unless isolation required).
- bun workspace (root `bun run check:web`; app-local from apps/mlai).
- Preserve Lab (see CLAUDE.md "Brand = Lab / Cyan + Serif", AGENTS "preserve current Lab identity").
- shadcn apply will reinstall components + mutate css/config/fonts/icons; use safe partial + backups + post-apply reconcile (components heavily customized with base-ui + glass + Lab).
- After any brand change: re-run og + refresh site/ assets + landing-page.test.
- All numeric/brand claims stay out of this (contracts + content own them).
- Verify with primary sources (running build + crawl + visual on key routes).

**Ownership**
- Research/decode/strategy + backup: researcher + plan.
- Apply + reconcile + color audit + fixes: implementer.
- Gates + review + docs updates + PR prep: reviewer + plan.
- Independent gate run + self-review required before "done".

### Task 1: Research, decode preset, backup, decide strategy

**Files:**
- Read/inspect: docs/superpowers/plans/*.md (all 4), apps/mlai/components.json, src/index.css, src/tokens.generated.css, packages/design-tokens/src/index.ts + generate.ts, apps/mlai/AGENTS.md + CLAUDE.md + GEMINI.md, root AGENTS.md + package.json, apps/mlai/package.json, glob src/components/ui/* + src/views/* + src/components/site/* + src/design/**/* + app/**/* + scripts/* + public/*.svg + site/*.html, grep for raw colors/hex/lucide/ glass-card/grad-text/cyan- /#05070d /#22d3ee (expect 100+ hits across 50+ files).
- Create: apps/mlai/.backup-ui/ (copy of src/components/ui before any change).
- Write: this plan (and any temp notes in task context).

**Interfaces:**
- Consumes: current Lab tokens, 39 lucide sites, custom glass/card variants, og py consts, site html inlines, accent.ts MAP.
- Produces: backup, strategy doc (overwrite vs partial), list of every file with raw color or font or icon.

- [ ] **Step 1: Re-inspect exactly as user directive (use glob/grep/read only)**
  ```bash
  # from repo root
  ls -1 docs/superpowers/plans/
  cat apps/mlai/components.json
  head -100 apps/mlai/src/index.css apps/mlai/src/tokens.generated.css
  cat packages/design-tokens/src/index.ts | head -80
  glob + read samples: app/layout.tsx app/global-error.tsx src/views/Home.tsx src/components/Navbar.tsx src/components/site/{PersonaCard,FeatureCard,accent}.ts src/components/ui/{button,card}.tsx
  grep -r --include='*.{ts,tsx,css,py,html,svg}' -E '#[0-9a-fA-F]{6}|cyan-[0-9]|text-cyan|bg-\[|from "lucide-react"' apps/mlai/src apps/mlai/app apps/mlai/scripts apps/mlai/site apps/mlai/public | wc -l
  grep -l 'glass-card\|grad-text\|font-display' apps/mlai/src apps/mlai/app | head -20
  ```
  Expected: confirm 39 lucide files, Lab hex in og.py/site/html/error/design, generate.ts outputs, no mira yet.

- [ ] **Step 2: Decode preset + shadcn apply behavior (re-run Context7 + local if possible)**
  Use inspected Context7 output: apply reinstalls components + updates cssVars/fonts/icons/config. For customized: backup + run exact, then restore/patch (or --no-reinstall + manual css/config only + force semantic). Olive will touch neutrals/muted; mira cyan aligns with our --cyan. Fonts will try ibm-plex + space-grotesk → override with Lab Spectral/Geist. iconLibrary → phosphor (add dep).

- [ ] **Step 3: Backup + strategy decision**
  ```bash
  cd apps/mlai
  cp -r src/components/ui .backup-ui-2026-09-22
  # also backup src/index.css src/tokens.generated.css package.json components.json
  ```
  Decision (documented in plan notes): **safe partial + exact run**. Run the cmd (it will touch config/css + reinstall ui). Immediately restore custom ui/ (base-ui + glass variants + Lab integrations), then overlay Lab vars + replace all raw. Achieve "entire" via exhaustive audit step (not blind overwrite). This preserves glassmorphism/persona/serif while taking mira cyan structure + radius + menu.

- [ ] **Step 4: Commit checkpoint (or stash)**
  git status; only clean or intentional.

### Task 2: Execute the preset apply

**Files:**
- Modify (via tool): apps/mlai/components.json, apps/mlai/src/index.css (and any new shadcn css injected), package.json (deps).
- May create/update: ui/ files (will be restored/patched in Task 3).

**Interfaces:**
- Consumes: current components.json + css.
- Produces: updated config + mira css vars + phosphor config.

- [ ] **Step 1: cd and run exact command**
  ```bash
  cd apps/mlai
  bunx --bun shadcn@latest apply --preset b6VP9Bgmwr
  ```
  (Expect prompt for overwrite/merge/skip on components; choose per strategy or use flags if available for non-interactive. If it fails on lock or node, use bunx resolution.)

- [ ] **Step 2: Immediate post-apply capture**
  ```bash
  git diff --name-only | cat
  cat components.json
  head -80 src/index.css
  ```
  Expected: style now "mira", iconLibrary phosphor (or equivalent), new css vars, possible new ui/*.tsx.

- [ ] **Step 3: Add phosphor dep if missing (exact per apply output)**
  ```bash
  bun add phosphor-icons/react   # or the exact lib the mira preset wires (inspect imports after apply)
  # do not remove lucide-react yet (39 direct sites)
  ```
  Run from apps/mlai or root as appropriate; update root lock via root install if needed.

- [ ] **Step 4: Verify no lockfile drift**
  From root: `bun install --frozen-lockfile --lockfile-only` (should pass or guide update).

### Task 3: Reconcile Lab identity + custom components (core preservation)

**Files:**
- Restore/patch: apps/mlai/src/components/ui/* (all 20+; keep base-ui + glass variant + Lab hover states; update only for new radius/--primary etc).
- Modify: apps/mlai/src/index.css (keep @import tokens + shadcn; overlay/re-assert Lab :root OKLCH + --cyan + .glass-card + .grad-text + h1-h3 font-display + grain; map any olive changes back to ink/cyan).
- Modify (if needed): packages/design-tokens/src/index.ts (only if semantic must match mira; prefer keep Lab as source-of-truth; then regen).
- Modify: apps/mlai/src/tokens.generated.css (via regen or direct if generator doesn't cover).

**Interfaces:**
- Consumes: backup + Lab source + new mira vars.
- Produces: Lab-primary css + custom ui that consume semantic + persona accents.

- [ ] **Step 1: Restore custom ui + patch for new theme**
  ```bash
  cd apps/mlai
  rm -rf src/components/ui
  cp -r .backup-ui-2026-09-22 src/components/ui
  # manual patch only: radius vars, primary references, any new menu styles from mira
  # do not accept mira's component source if it drops glass or base-ui
  ```
  Re-apply glass variant logic using new --card etc + cyan hover.

- [ ] **Step 2: Re-assert Lab in css (never lose signature)**
  Edit src/index.css + tokens (after any mira injection):
  - Keep --font-display: Spectral...
  - --primary: var(--cyan); --ring: var(--cyan) etc.
  - .glass-card and .home-*.glass exact as before (cyan border on hover).
  - .grad-text exact.
  - body h1-h3 font-display.
  - Persona dots / accent use existing cyan/violet/emerald (not olive neutrals).
  - Add any mira radius if improved, but keep --radius-2xl for glass.

- [ ] **Step 3: Sync design-tokens if semantic affected**
  If mira changes base/muted that break Lab, update packages/design-tokens/src/index.ts semantic + legacyWeb only for alignment; run generator (see root scripts or `bun run tokens:generate` if present; otherwise manual copy to src/tokens.generated.css + verify diff).

### Task 4: Exhaustive audit + replace raw colors/hex + propagate (entire codebase)

**Files (from grep + globs; every one must be touched or confirmed clean):**
- All `src/views/*.tsx` (Home, Products, Console*, Login, Security, Services, Team, Docs, Research, Showcase*, etc. — 30+).
- `src/components/{ui,site}/*` (card glass, accent.ts MAP, FeatureCard, PersonaCard, Navbar, Hero, etc.).
- `app/{layout,global-error,error,not-found*}.tsx` + route client.tsx.
- `src/design/**/*` (all boards, console, marketing, mlai-ds-tokens.css).
- `src/film/*`, `src/trailer/*`, `src/design/console/*`.
- `scripts/generate-og.py` (update consts if any drift; keep exact Lab values for brand match).
- `research/public/assets/lab.css`, `scripts/research-preview.css`, `scripts/export-research.tsx`.
- `site/index.html`, `site/404.html` (embedded styles + theme-color + svg stops).
- `public/logo*.svg`, `public/mlai-*.svg`, `public/favicon.svg` (gradients; align to Lab cyan if changed).
- `src/index.css`, tokens, any other css.
- docs/ (if they hardcode old style), CLAUDE/AGENTS/GEMINI (update iconLibrary note + "mira + Lab overlay").
- tests that snapshot colors or landing.

**Interfaces:**
- Consumes: full grep list + semantic vars from tokens.
- Produces: zero raw #hex or direct cyan-400 outside persona accents + accent.ts; all use var(--cyan)/text-primary/bg-card/.glass-card or explicit persona classes.

- [ ] **Step 1: Global replace pass (use editor + verify)**
  Replace patterns:
  - `#05070d` → `var(--ink)` or `bg-background` (prefer semantic or Lab custom).
  - `#22d3ee` / `cyan-400` (non-persona) → `var(--cyan)` / `text-primary` / `border-primary`.
  - Hardcoded in glass hover / grad → keep .grad-text + .glass-card classes.
  - accent.ts MAP stays (cyan/violet/emerald classes are the persona contract).
  - Inline in error/global-error/og.py/site.html → update to Lab values or css vars (inline must stay self-contained).
  - SVGs: keep or make stops use current Lab cyan for consistency.
  Verify no breakage of persona dots.

- [ ] **Step 2: Icon propagation**
  After phosphor dep: ui/* that were reinstalled will use phosphor; direct lucide in 39 views/components stay (lucide continues to work; do not mass-replace unless breakage). Update any icon size/radius in new style. Add note in AGENTS if dual icon libs.

- [ ] **Step 3: Fonts/radius/menu**
  Force Spectral/Geist in css + layout (ignore preset ibm/space). Use --radius* from tokens. Menu styles from components.json + css.

- [ ] **Step 4: Proof no raw left**
  ```bash
  grep -rnE '#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|cyan-[0-9]{3}' apps/mlai/src apps/mlai/app apps/mlai/scripts apps/mlai/site apps/mlai/public --include='*.{ts,tsx,css,py,html,svg}' | grep -v 'accent.ts\|persona\|--cyan\|var(--cyan)' | cat
  ```
  Expected: only approved persona + var usages.

### Task 5: Fix breakage + integration

**Files:**
- apps/mlai/src/components/ui/card.tsx (glass variant), button, Navbar, layout, views that use cards/forms (showcase, console, inquiry, home).
- Any new mira radius or font classes that clash with glass.

**Interfaces:**
- Consumes: post-reconcile tokens + ui.
- Produces: no layout shift, glass hover works, buttons/forms use new primary, no console errors on key routes.

- [ ] **Step 1: Manual test critical surfaces (dev server)**
  Home hero + glass cards + grad-text + persona dots.
  Navbar (mobile sheet + buttons).
  Products/Research grids.
  Console + design boards (if reachable).
  Forms (inquiry, login).
  Error boundary (hard reload).

- [ ] **Step 2: Patch as found** (e.g. glass hover cyan ring, font-display on headings, selection bg).

### Task 6: Gates + verification (run until green)

**Files touched by verification:** sitemap, build artifacts, public/ (after og), .design-sync (after css), test snapshots if any.

- [ ] **Step 1: App gates (from apps/mlai or root)**
  ```bash
  cd /Users/donaldfilimon/dev/active/mlai
  bun run check:web
  # or explicit:
  cd apps/mlai && bun run lint && bun run test && bun run build
  ```
  Expected: 0 exit, no tsc, tests pass, build succeeds (sitemap + research + next).

- [ ] **Step 2: Brand + design**
  ```bash
  bun run og
  bun run design-sync:css
  # refresh site/ assets if changed (copy public/og* + icons matching byte where possible)
  ```
  Expected: new pngs match Lab (cyan on ink).

- [ ] **Step 3: Browser verification**
  ```bash
  bun run dev   # in background
  bun run crawl
  ```
  Expected: no dead links, no console errors on themed routes, glass/grad/persona visible, reduced-motion ok.

- [ ] **Step 4: Visual + a11y spot (researcher/reviewer)**
  Key pages (/, /products, /research, /console, /showcase/*, design boards). Check fonts (Spectral headlines), cyan accents, glass depth, no olive wash on ink, icons render.

### Task 7: Documentation + final state

**Files:**
- Modify: apps/mlai/AGENTS.md, CLAUDE.md, GEMINI.md (add "mira + Lab overlay; iconLibrary=phosphor in config but lucide kept for direct imports; run og + design-sync after theme changes"; link this plan).
- Root docs if style mentioned.
- This plan file (add actual file lists from execution + "all open items closed").

- [ ] **Step 1: Update conventions**
  Note the safe partial strategy + Lab invariants.

- [ ] **Step 2: PR-ready**
  ```bash
  git status
  git add -A
  git diff --stat
  # conventional commit e.g. "feat(theme): apply shadcn mira preset b6VP9Bgmwr with full Lab reconciliation"
  ```
  No dirty files, all gates green, plan self-review complete, no open TODO in this work.

### Self-Review (template for reviewer)

- Spec coverage: all 10 points + "entire codebase" via explicit audit list + "run exact cmd" + "preserve Lab".
- Placeholders: none (every step names exact files/cmds from inspection).
- Type/brand consistency: Lab tokens remain source; accent.ts + persona untouched; glass + grad classes authoritative.
- Known deviation/risk: apply will attempt component reinstall → mitigated by backup + restore + post-patch; olive may shift muted → explicitly re-mapped in reconcile; 39 lucide files not mass-migrated (documented).
- Verification: every gate step + grep proof + visual on representative routes + og + crawl.
- Subagent: researcher owns decode + initial grep; implementer owns apply/reconcile/audit/fix; reviewer owns final gates + this review + PR.

**Done means:** plan file exists + committed, all steps checked green in execution, `bun run check:web` + crawl + og clean, no raw colors outside approved, Lab signature visually + in code identical, PR description references this plan.
