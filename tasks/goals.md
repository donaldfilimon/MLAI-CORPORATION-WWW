# Downloads checkout consolidation

This record replaces the stale pre-monorepo checklist imported from
`bdf30b397333b9be3d460a3d2af784d5a00a59f2`. Its original text remains in Git history.

The canonical checkout is `~/dev/active/mlai`. The old Downloads checkout used
root-level web source; this repository keeps web, mobile and Quasar independent.

## Integration decisions (2026-09-06)

- `442c7bc`: design-sync CSS generation and destructive foreground token are
  already present under `apps/web`; the current tests additionally understand
  nullable component mappings and the two-layer export barrel.
- `7152476` and `38c3ec6`: the BacktracePanel and responsive hero guards are
  already present. Preserve the subsequent Quesar copy and hydration fixes.
- `9a0c441`: transfer the dependency upgrades for packages still used by web
  into `apps/web/package.json` and regenerate its independent lockfile. Keep
  `regl`, `@tanstack/react-virtual`, `autoprefixer` and `tsx` removed as decided
  in `d130c97`; preserve monorepo-only dependencies and root orchestration.
- `05ee1ce`: the CSP extraction and all seven original tests already landed
  in `ed1f758`, plus Turnstile and reporting guards. Keep the strict development
  predicate and the complete current allowlist. The retired Python crawler
  is superseded by direct Playwright calls that fail on evaluation/navigation
  errors; do not recreate its external-wrapper dependency.
- `bdf30b3`: preserve the reconciliation history through merge ancestry; this
  updated record describes the canonical topology and disposition.

The generated root sitemap and old root design-sync notes stay retired. Their
canonical app-local counterparts and complete history remain available.

## Validation

The canonical aggregate gate passed before and after integration with Bun
1.4.3: web TypeScript, 270 Vitest tests and Next build; mobile TypeScript, 41
Jest tests, lint and Expo web export; Quasar TypeScript, 60 tests and Expo web
export. The updated web lockfile passed a frozen install, and design-sync CSS
generation passed with the upgraded Tailwind packages. Local validation does
not establish hosted CI or deployment success.
