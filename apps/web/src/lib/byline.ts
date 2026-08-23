/**
 * Shared parsing for the content layer's byline strings.
 *
 * Hoisted into its own module for the same reason `dates.ts` was: two
 * consumers need it and neither may import the other. `structured-data.ts`
 * already imports `SITE_URL` from `route-meta.ts`, so a helper living in
 * `structured-data.ts` could not be reached from `route-meta.ts` without a
 * cycle — and a second copy is exactly how the two files drifted apart in the
 * first place.
 *
 * The content layer separates multi-team bylines with a MIDDLE DOT, not a
 * comma — `"MLAI Research · WDBX Core"`, `"MLAI Safety Engineering · Product"`.
 * Both separators are accepted because a comma is the form a future editor is
 * most likely to reach for, and silently treating `"A, B"` as one name is the
 * bug this replaces.
 */

/** Byline split into its individual names. Empty array when there is nothing to split. */
export function bylineNames(byline: string | undefined | null): string[] {
  return (byline ?? "")
    .split(/[,·]/)
    .map((name) => name.trim())
    .filter(Boolean);
}
