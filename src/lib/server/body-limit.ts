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

/** Returns the body text, or null if it exceeds `max` bytes. */
export async function readBodyLimited(req: Request, max: number): Promise<string | null> {
  const declared = req.headers.get("content-length");
  if (declared) {
    const n = Number(declared);
    if (Number.isFinite(n) && n > max) return null;
  }

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
}

export function payloadTooLarge(): Response {
  return Response.json({ error: "Payload too large" }, { status: 413 });
}
