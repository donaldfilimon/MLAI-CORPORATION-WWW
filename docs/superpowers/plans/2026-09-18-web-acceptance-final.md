# Web Acceptance Finalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all remaining a11y and cinematic route defects to achieve full WCAG 2.2 A/AA compliance and polished cinematic playback.

**Architecture:** 
- Use `window.matchMedia` for global reduced-motion gating in the film engine.
- Configure KaTeX for MathML output to support screen readers.
- Implement `aria-pressed` state management for interactive design boards.
- Shift Kokoro model loading to a user-gesture trigger.

**Tech Stack:** Next.js 15, React 19, KaTeX, TensorFlow.js, Kokoro-js.

**Spec:** Derived from the "Extend web acceptance" goal and axe-core audit findings.

## Global Constraints
- Maintain "Quesar by MLAI" branding.
- No breaking changes to existing routed paths.
- All changes must pass `bun run check:web`.

---

### Task 1: Global Reduced Motion Gating

**Files:**
- Modify: `apps/quasar-web/src/film/engine.tsx`
- Modify: `apps/quasar-web/src/film/Film.tsx`
- Test: `apps/quasar-web/src/__tests__/film-playback.test.ts`

**Interfaces:**
- Consumes: `window.matchMedia("(prefers-reduced-motion: reduce)")`
- Produces: Gated playback state in `TimelineContext`

- [ ] **Step 1: Write test for reduced motion detection**
  ```typescript
  it("stops animations when prefers-reduced-motion is reduce", () => {
    // Mock matchMedia to return matches: true
    // Verify that playback logic skips frames or stays static
  })
  ```
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement reduced-motion gate in `Stage` component**
  Wrap the `requestAnimationFrame` loop in a check for `prefers-reduced-motion`. If true, set `playing` to false or clamp `dt` to 0.
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

### Task 2: Cinematic Route Polish

**Files:**
- Modify: `apps/quasar-web/src/film/engine.tsx` (Scrubber loop)
- Modify: `apps/quasar-web/src/components/Logo.tsx` (Voice toggle sizing)
- Modify: `apps/quasar-web/src/film/neural-voice.ts` (Lazy load trigger)

**Interfaces:**
- Consumes: `NeuralVoice.load()`
- Produces: User-gesture triggered model loading

- [ ] **Step 1: Implement playhead loop-back**
  In `advance()` or `Stage`'s `setTime`, if `time > duration`, set `time = 0`.
- [ ] **Step 2: Adjust VoiceToggle sizing for 320px**
  Ensure the toggle uses relative units or a smaller fixed size on mobile to avoid layout shift.
- [ ] **Step 3: Shift Kokoro load to user gesture**
  Remove `NeuralVoice.load()` from `useEffect` in `VoiceToggle`. Move it to the `onClick` handler or the first interaction with the `Stage`.
- [ ] **Step 4: Verify fixed layout on 320px viewport**
- [ ] **Step 5: Commit**

### Task 3: Design Board a11y

**Files:**
- Modify: `apps/quasar-web/src/design/board/DesignBoard.tsx`
- Modify: `apps/quasar-web/src/design/board/depth.tsx`

**Interfaces:**
- Produces: `aria-pressed` attributes on toggle buttons.

- [ ] **Step 1: Add state for active tweak buttons**
  Ensure the buttons in the `TweaksPanel` track their active state via `aria-pressed="true/false"`.
- [ ] **Step 2: Verify via Playwright/axe-core**
- [ ] **Step 3: Commit**

### Task 4: KaTeX MathML & Global a11y

**Files:**
- Modify: `apps/quasar-web/src/lib/katex-config.ts` (or where KaTeX is initialized)
- Modify: `apps/quasar-web/src/components/page-layout.tsx` (Heading order)
- Modify: `apps/quasar-web/app/login/page.tsx` (Link-in-text)
- Modify: `apps/quasar-web/app/signup/page.tsx` (Link-in-text)

**Interfaces:**
- Consumes: KaTeX `output: "mathml"` configuration.

- [ ] **Step 1: Enable MathML output in KaTeX**
  Update the KaTeX render call to use `output: "mathml"` instead of `"html"`.
- [ ] **Step 2: Fix heading order on Home and About pages**
  Ensure `<h1>` $\rightarrow$ `<h2>` $\rightarrow$ `<h3>` sequence is strictly followed without skips.
- [ ] **Step 3: Resolve link-in-text on auth pages**
  Wrap the "already have an account" / "new to Quesar" text in separate spans so the link is not nested in a way that confuses screen readers.
- [ ] **Step 4: Run `bun run check:web` to verify no regressions**
- [ ] **Step 5: Commit**

### Task 5: Final a11y Audit

**Files:**
- Test: `apps/quasar-web/src/__tests__/a11y-source.test.ts`

- [ ] **Step 1: Run full axe-core scan on all 26 routes**
- [ ] **Step 2: Verify all "Open" items from the previous audit are now "Closed"**
- [ ] **Step 3: Final Commit**
