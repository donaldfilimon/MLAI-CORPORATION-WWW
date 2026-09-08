# MLAI review v2 — focused improvement plan

Baseline: exact extracted `MLAI-website-source.zip` from the last handoff. Work is isolated in a new container directory; no repository, account, domain, or hosted site is changed.

## Goal
Improve the existing experience and its test coverage, not produce another independent design. Preserve the 17 content routes, copy, project relationships, and white/violet visual identity.

## Tasks
1. Record inherited behavior and failing regression tests before implementation.
2. Search: normalize queries and indexed text consistently, contextual excerpts, section-aware destinations, safe highlighting, accessible active result, and accurate total/more-results feedback.
3. Reading: estimated reading time, progress, active section links, mobile TOC, copy/download Markdown derived from the same source, and print layout.
4. Existing controls: searchable/shareable evidence filters and consistent URL updates; system-aware theme; keyboard topic tabs.
5. Brief: fail-closed controls before enhancement, bounded field validation, session-memory-only draft continuity, and safe copy/download behavior.
6. Build/release: check declared dependencies and upstream setup, add required MDX typings, reproducible checks, verify real HTTP output/headers, and retain framework gates as blocked unless actually executed.
7. Rerun baseline plus new tests, strict core typing, export/link checking, mobile/desktop screenshots and actual browser interactions. Package only after evidence is recorded.

## Constraints
No new AI, accounts, analytics, payments, remote submissions, or performance claims. No invented lockfile, framework success, accessibility certification, or deployment. Keep old verification history distinct from new results. Reading progress and highlighting are locally computed UI state, not live system telemetry.

## Completion record

- [x] Baseline and failing regression evidence recorded.
- [x] Contextual search, reading tools, filters/theme, and brief improvements implemented.
- [x] Core type checks, review export, links, real HTTP checks and both browser suites passed.
- [x] Desktop/mobile, search, docs, evidence and dark-theme screenshots inspected.
- [x] Documentation and versioned delivery prepared.
- [ ] Full Next/React/Fumadocs installation, build and hydration — blocked by registry DNS; not represented as passing.
