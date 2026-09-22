export type EpisodeResult =
  | { ok: true; record: string }
  | { ok: false; reason: "gateway-absent" };

async function readGateway(
  gatewayUrl: string | undefined,
  path: string,
): Promise<EpisodeResult> {
  if (!gatewayUrl) return { ok: false, reason: "gateway-absent" };
  try {
    const response = await fetch(new URL(path, gatewayUrl), {
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) return { ok: false, reason: "gateway-absent" };
    const record = await response.text();
    if (!record) return { ok: false, reason: "gateway-absent" };
    return { ok: true, record };
  } catch {
    return { ok: false, reason: "gateway-absent" };
  }
}

/** Reads one episode from a configured WDBX gateway. A missing or unreachable gateway fails closed. */
export function readEpisode(gatewayUrl: string | undefined, id: string): Promise<EpisodeResult> {
  if (!id) return Promise.resolve({ ok: false, reason: "gateway-absent" });
  return readGateway(gatewayUrl, `/episodes/${encodeURIComponent(id)}`);
}

/** Reads one receipt. A missing or unreachable gateway fails closed and never fabricates a record. */
export function readReceipt(gatewayUrl: string | undefined, id: string): Promise<EpisodeResult> {
  if (!id) return Promise.resolve({ ok: false, reason: "gateway-absent" });
  return readGateway(gatewayUrl, `/receipts/${encodeURIComponent(id)}`);
}

/** Reads one vector. A missing or unreachable gateway fails closed and never fabricates a record. */
export function readVector(gatewayUrl: string | undefined, id: string): Promise<EpisodeResult> {
  if (!id) return Promise.resolve({ ok: false, reason: "gateway-absent" });
  return readGateway(gatewayUrl, `/vectors/${encodeURIComponent(id)}`);
}
