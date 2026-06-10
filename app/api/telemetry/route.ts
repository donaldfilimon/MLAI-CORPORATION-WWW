import { getDb } from "@/lib/server/db";
import { rateLimit, tooMany } from "@/lib/server/rate-limit";

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

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const event = typeof body.event === "string" ? body.event : "";
  if (!TELEMETRY_EVENTS.has(event)) {
    return Response.json({ error: "Unknown event" }, { status: 400 });
  }
  // Path is trimmed to a pathname (no query — queries can carry identifiers).
  const rawPath = typeof body.path === "string" ? body.path : "";
  const path = rawPath.startsWith("/") ? rawPath.split("?")[0]!.slice(0, 128) : "";

  try {
    getDb().prepare("INSERT INTO telemetry_events (event, path) VALUES (?, ?)").run(event, path);
  } catch (err) {
    console.error("Database error saving telemetry event:", err);
  }
  // Always 204 — telemetry must never affect the user-facing flow.
  return new Response(null, { status: 204 });
}
