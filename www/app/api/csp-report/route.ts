/**
 * CSP violation sink.
 *
 * The Content-Security-Policy in `next.config.ts` is a hand-curated allowlist
 * over a surface that moves (a jsDelivr version bump, a new Hugging Face host,
 * a new avatar origin). Without a report sink the first signal that the policy
 * broke a feature is a user complaint. This endpoint gives the browser
 * somewhere to send violations so they show up in the platform logs.
 *
 * Privacy: nothing is persisted. This deliberately does NOT write to the
 * `telemetry_events` table — that surface has a strict event allowlist and
 * stores no identifiers, and CSP reports carry full URLs and user-agent
 * context. They go to stdout only, where the platform's own retention applies.
 */

import { payloadTooLarge, readBodyLimited } from "@/lib/server/body-limit";
import { rateLimit, tooMany } from "@/lib/server/rate-limit";

// Browsers post violations without credentials and expect a fast, bodyless
// response. Never gate this on a session — an unauthenticated visitor hitting a
// broken policy is exactly the case worth hearing about.
export async function POST(req: Request): Promise<Response> {
  // Same window as /api/telemetry, and for the same reason: unauthenticated,
  // machine-emitted, near-duplicate. A single page load against a broken
  // directive can legitimately emit tens of un-batched reports (one per blocked
  // subresource), so an inquiries-shaped 5/5min would drop real signal — but the
  // actionable content is "directive D blocked URI U", which you already have
  // after report #1, so shedding the tail costs nothing.
  //
  // Must stay the FIRST statement: the body read below still buffers up to the
  // 64 KB cap, so a limiter placed after it has already paid the per-request
  // cost it exists to avoid.
  if (!rateLimit("csp-report", req, { windowMs: 60 * 1000, max: 60 })) return tooMany();

  // 64 KB cap: real CSP reports are a few hundred bytes; the handler only ever
  // logs the first 2000 chars anyway. Rate limiting caps request COUNT; this
  // caps request SIZE. `readBodyLimited` never rejects — an aborted read comes
  // back as null like an oversize one — so this endpoint's never-5xx property
  // holds without a defensive wrapper here. That invariant is pinned in
  // body-limit.test.ts, which is where it belongs.
  const raw = await readBodyLimited(req, 64 * 1024);
  if (raw === null) return payloadTooLarge();

  if (raw) {
    // Two wire formats in the wild: the legacy `report-uri` shape
    // ({"csp-report": {...}}, content-type application/csp-report) and the
    // Reporting API batch used by `report-to` (an array of {type, body}).
    // Log whichever arrived rather than trying to normalize — the point is a
    // greppable signal, not a schema.
    console.warn("[CSP] violation report:", raw.slice(0, 2000));
  }

  // 204 on success: the spec wants no content for an accepted report.
  return new Response(null, { status: 204 });
}
