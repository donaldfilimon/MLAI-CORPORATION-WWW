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
 * Every JSON route wants the same three outcomes — over the cap → 413,
 * unparseable → 400, otherwise the parsed value — so that contract lives here
 * once instead of being restated at each call site. Callers narrow with a
 * single `instanceof Response` check; `JSON.parse` can never yield a
 * `Response`, so the union is unambiguous.
 *
 * `T` is an assertion, not a validation: this only guarantees the body was
 * valid JSON within the cap. Routes still validate their own fields — see
 * `TELEMETRY_EVENTS` or the inquiry length checks.
 */
export async function readJsonLimited<T>(req: Request, max: number): Promise<T | Response> {
  const raw = await readBodyLimited(req, max);
  if (raw === null) return payloadTooLarge();
  try {
    return JSON.parse(raw) as T;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
