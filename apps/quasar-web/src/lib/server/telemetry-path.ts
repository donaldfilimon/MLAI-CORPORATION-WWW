/**
 * Path allowlisting for the telemetry sink.
 *
 * `telemetry_events` is privacy-by-design: allowlisted event + pathname +
 * timestamp, and NO identifiers. `event` was allowlisted from day one; `path`
 * was not — the handler only required a leading "/", stripped the query, and
 * truncated to 128 chars. That left a free-text column writable by anonymous
 * callers, so `{"event":"inquiry_open","path":"/u/victim@example.com"}` stored
 * that string verbatim and `GET /api/telemetry/summary` then rendered it to an
 * admin. Allowlisting the path the same way the event is allowlisted is what
 * makes the table's stated contract actually true.
 *
 * Two-tier check, matching how routes are actually defined:
 *   - static routes come from `routeMetadata`, which is the register every
 *     route must appear in (see CLAUDE.md), so this can't drift as pages are
 *     added or removed;
 *   - the four dynamic families are matched STRUCTURALLY (segment shape +
 *     URL-safe slug charset) rather than against real slugs. Resolving a slug
 *     would mean scanning `content.blog` / `.research.publications` / `.team` /
 *     `.products` on every beacon, and buys nothing the privacy contract needs:
 *     a structurally-valid slug is already incapable of carrying an email, a
 *     token, or free text with spaces or punctuation. (`route-meta` imports
 *     `@/data` regardless — but that module graph is inert object literals with
 *     no module-scope parsing, and the single-process model means pages have it
 *     resident anyway.)
 *
 * Anything else normalizes to `""` — the request is NOT rejected. Telemetry
 * must still 204; only the stored value changes.
 */
import { routeMetadata } from "@/lib/route-meta";

/**
 * `/blog|research|team|products` + exactly one lowercase, hyphen-separated
 * slug. Matches every slug in the content layer today (`wdbx-v2-release`,
 * `zig-016-migration`, `abbey`, …) and admits no character that could carry an
 * identifier: no "@", no ".", no space, no uppercase, no second segment.
 */
const DYNAMIC_ROUTE = /^\/(?:blog|research|team|products)\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** The old truncation bound, reused as a rejection bound — no real route is longer. */
const MAX_PATH_LENGTH = 128;

/**
 * Map a client-supplied `path` onto a known route, or `""`.
 *
 * `""` rather than an `"other"` sentinel: the column already stores `""` for a
 * missing or non-slash path, so this needs no migration and introduces no new
 * bucket that `/api/telemetry/summary` consumers would have to learn.
 *
 * The real client (`src/lib/telemetry.ts`) only ever sends
 * `window.location.pathname`, so this strictness costs legitimate traffic
 * nothing.
 */
export function normalizeTelemetryPath(value: unknown): string {
  if (typeof value !== "string") return "";

  // A query or fragment is discarded outright — never inspected, never stored.
  // Queries are exactly where identifiers hide, and there is no version of one
  // this table wants. Dropping the tail rather than rejecting the whole value
  // is safe *because* what survives still has to match the allowlist below: a
  // real pathname with a stray query keeps its pageview, and "/u/x?token=abc"
  // is no more acceptable once trimmed than it was before.
  let path = value.split(/[?#]/)[0]!;
  // Next redirects "/about/" → "/about", so a trailing slash never reaches a
  // real pathname — but tolerate one rather than discarding an otherwise
  // legitimate hit.
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

  if (path.length === 0 || path.length > MAX_PATH_LENGTH) return "";
  // hasOwn, not `in` / `routeMetadata[path]`: "constructor" and "toString" are
  // reachable through the prototype and would otherwise pass as known routes.
  if (Object.hasOwn(routeMetadata, path)) return path;
  return DYNAMIC_ROUTE.test(path) ? path : "";
}
