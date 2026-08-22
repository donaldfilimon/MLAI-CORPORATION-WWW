import { readJsonLimited } from "@/lib/server/body-limit";
import { getDb } from "@/lib/server/db";
import { rateLimit, tooMany } from "@/lib/server/rate-limit";
import { normalizeTelemetryPath } from "@/lib/server/telemetry-path";

// Allowlisted events only; honors DNT / Sec-GPC; stores no identifiers.
const TELEMETRY_EVENTS = new Set([
  "inquiry_open",
  "inquiry_submit",
  "inquiry_success",
  "inquiry_close",
]);

export async function POST(req: Request) {
  if (!rateLimit("telemetry", req, { windowMs: 60 * 1000, max: 60 })) return tooMany();

  if (req.headers.get("DNT") === "1" || req.headers.get("Sec-GPC") === "1") {
    return new Response(null, { status: 204 });
  }

  // 4 KB cap: the payload is {event, path} only.
  const body = await readJsonLimited<{ event?: unknown; path?: unknown }>(req, 4 * 1024);
  if (body instanceof Response) return body;

  const event = typeof body.event === "string" ? body.event : "";
  if (!TELEMETRY_EVENTS.has(event)) {
    return Response.json({ error: "Unknown event" }, { status: 400 });
  }
  // Path is allowlisted against the real route set, exactly like `event` above
  // — a leading-"/" check is not validation. `path` arrives unauthenticated, so
  // anything unrecognized becomes "" rather than being stored verbatim; the
  // request still succeeds. See `normalizeTelemetryPath` for why.
  const path = normalizeTelemetryPath(body.path);

  try {
    getDb().prepare("INSERT INTO telemetry_events (event, path) VALUES (?, ?)").run(event, path);
  } catch (err) {
    console.error("Database error saving telemetry event:", err);
  }
  // Always 204 — telemetry must never affect the user-facing flow. The two
  // exceptions above are both malformed *requests*, not failures of the sink:
  // a body over the cap (413) or one that is not a JSON object (400) from
  // `readJsonLimited`, and an unknown event (400). A real beacon never hits
  // them, and a DB failure below is swallowed rather than surfaced.
  return new Response(null, { status: 204 });
}
