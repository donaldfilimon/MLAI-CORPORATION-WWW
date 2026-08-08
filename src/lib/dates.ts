/**
 * Shared date parsing for the content layer's human-readable date strings
 * ("June 9, 2026", "JUNE 2026"). Hoisted out of `feed.ts` so `route-meta.ts`
 * can reuse it (for `article:published_time`) without a `route-meta.ts` ⇄
 * `feed.ts` import cycle (`feed.ts` itself imports `SITE_URL`/
 * `DEFAULT_ROUTE_META` from `route-meta.ts`).
 */

/** Returns ms-epoch, or null when the string can't be parsed as a date. */
export function parseContentDate(value: string): number | null {
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

/** `parseContentDate` result as an ISO-8601 string, or undefined if unparseable. */
export function toIsoDate(value: string): string | undefined {
  const t = parseContentDate(value);
  return t === null ? undefined : new Date(t).toISOString();
}
