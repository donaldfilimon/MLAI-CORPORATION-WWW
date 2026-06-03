# Design System Upgrade Specification

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
