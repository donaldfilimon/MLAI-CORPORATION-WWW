/**
 * Byte-capped request body reads for route handlers.
 *
 * Next 15 App Router route handlers have NO default body cap — `bodyParser`
 * config is Pages Router only, and `bodySizeLimit` applies to Server Actions.
 * Cloud Run's HTTP/1 ceiling is 32 MB, so an unauthenticated POST route can be
 * made to buffer 32 MB per request. Rate limiting caps request COUNT; this caps
 * request SIZE. Both are needed.
 *
 * `Content-Length` is absent on chunked requests, so a header check alone is
 * not a cap — it is only a cheap early exit. The streaming counter below is
 * the actual guarantee.
 */

/**
 * Returns the body text, or null if it exceeds `max` bytes — or if the stream
 * errors mid-read (a client aborting an upload). The old `await req.json()`
 * sat inside each route's try/catch, so an abort mapped to that route's 400;
 * an uncaught rejection here would instead escape the handler as a 500. A 413
 * to a client that is already gone is harmless, so aborted reads collapse to
 * the same null as oversize ones rather than throwing. (`reader.cancel()` on
 * an already-errored stream also rejects, per spec — same net.)
 */
export async function readBodyLimited(req: Request, max: number): Promise<string | null> {
  const declared = req.headers.get("content-length");
  if (declared) {
    const n = Number(declared);
    if (Number.isFinite(n) && n > max) return null;
  }

  try {
    const reader = req.body?.getReader();
    if (!reader) return "";

    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > max) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }

    const joined = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      joined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new TextDecoder().decode(joined);
  } catch {
    return null;
  }
}

/** The 413. Exported for routes that read raw text rather than JSON (csp-report). */
export function payloadTooLarge(): Response {
  return Response.json({ error: "Payload too large" }, { status: 413 });
}

/**
 * Read a capped JSON body, or the `Response` the handler should return.
 *
 * Every JSON route wants the same four outcomes — over the cap → 413,
 * unparseable → 400, parseable but not a JSON *object* → 400, otherwise the
 * parsed value — so that contract lives here once instead of being restated at
 * each call site. Callers narrow with a single `instanceof Response` check;
 * `JSON.parse` can never yield a `Response`, so the union is unambiguous.
 *
 * The object-shape check is load-bearing, not cosmetic. `null`, `5`, `"str"`,
 * `true` and `[]` are all *valid* JSON, so without it they sail past the parse
 * and past the caller's `instanceof Response` narrowing, and the first
 * `body.field` access throws — which happens OUTSIDE each route's try/catch,
 * so the 400 the route intended escaped as a 500. On `/api/inquiries` and
 * `/api/telemetry` that was an unauthenticated 500 (and on telemetry it broke
 * that handler's own "always 204" invariant).
 *
 * So the contract `T` carries is now split in two:
 *   - SHAPE is guaranteed. The value is a non-null, non-array object, so
 *     property access on it is safe.
 *   - FIELDS are still an assertion, not a validation. Nothing here inspects
 *     them, which is why routes keep their own per-field checks (see
 *     `TELEMETRY_EVENTS`, or the inquiry length checks) and why callers should
 *     declare `T` with `unknown`-typed fields.
 *
 * A top-level array is rejected with the rest because no `readJsonLimited`
 * caller wants one. The one route that legitimately accepts an array body —
 * `/api/csp-report`, for the Reporting API batch format — reads raw text
 * through `readBodyLimited` and never comes through here.
 */
export async function readJsonLimited<T>(req: Request, max: number): Promise<T | Response> {
  const raw = await readBodyLimited(req, max);
  if (raw === null) return payloadTooLarge();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return invalidJsonBody();
  }
  // Same 400 as the unparseable branch on purpose: from a client's point of
  // view "your body was not a JSON object" is the same class of mistake, and
  // reusing the shape means no caller has to learn a new error string.
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return invalidJsonBody();
  }
  return parsed as T;
}

function invalidJsonBody(): Response {
  return Response.json({ error: "Invalid JSON body" }, { status: 400 });
}
