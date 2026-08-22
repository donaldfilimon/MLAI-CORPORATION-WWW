# Design System Upgrade Specification

> **Status: Superseded — implemented (2026-06).** All four proposed upgrades shipped — the modular type scale (`--text-h0…h5`, Major-Third), tuned glass depth + a global film-grain overlay, formalized `container-custom`/`section-y` rhythm, and consistent `glass-card`/`section-title` use across Home/About/Team/Benchmarks/Docs — and the subsequent **"Lab" redesign** carried the system further: a serif (Spectral) display face, a cyan/blue→violet palette on near-black ink, the tri-persona embedding-galaxy hero, `grad-text` headlines, and the measured/target/reported provenance legend. The live design system is documented in `CLAUDE.md` (Styling section) and implemented in `src/index.css`. This file is retained as the historical planning artifact — do not action it as pending work.

## Overview
A comprehensive refresh of the MLAI Corporation website aesthetic to improve visual depth, typographical hierarchy, and responsive scaling.

## Current State
- Tailwind 4 / shadcn/ui foundation.
- Decoupled from legacy global CSS, relying heavily on Tailwind utility classes.
- Inconsistent spacing and visual hierarchy across nested pages.

## Proposed Design Upgrades
1. **Typography Refresh**: Refine font pairings to prioritize readability and visual authority. Introduce a modular scale for headers.
2. **Visual Depth**: Enhance glassmorphism and subtle lighting effects (`--color-surface` and `--color-bg` tuning). Introduce consistent "premium" noise texture globally.
3. **Responsive Scaling**: Formalize the `container-custom` and modular grid patterns for all primary sections.
4. **Consistency**: Apply consistent `glass-card` and `section-title` utility classes across `Home`, `About`, `Team`, `Benchmarks`, and `Docs`.

## Implementation Strategy
- Incremental updates to CSS variables in `index.css`.
- Standardize layout components.
- Apply consistent animation patterns via `framer-motion`.

## User Review
Please review this design strategy. Does this align with your vision for MLAI Corp's aesthetic, or are there specific areas you'd like to prioritize?
