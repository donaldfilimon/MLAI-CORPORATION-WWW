import { getDb } from "@/lib/server/db";
import { getSession } from "@/lib/server/session";
import { checkAdminAccess } from "@/lib/server/workos";

export async function GET(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = await checkAdminAccess(user);
  if (!admin.ok) return Response.json({ error: admin.error }, { status: 403 });

  try {
    const rows = getDb()
      .prepare(
        "SELECT event, COUNT(*) as count FROM telemetry_events GROUP BY event ORDER BY count DESC",
      )
      .all() as unknown as Array<{ event: string; count: number }>;
    const byEvent = Object.fromEntries(rows.map((r) => [r.event, r.count]));
    const opens = byEvent["inquiry_open"] ?? 0;
    const successes = byEvent["inquiry_success"] ?? 0;
    return Response.json({
      ok: true,
      events: byEvent,
      conversion: {
        opens,
        successes,
        rate: opens > 0 ? Number((successes / opens).toFixed(4)) : null,
      },
    });
  } catch (err) {
    console.error("Database error loading telemetry summary:", err);
    return Response.json({ error: "Failed to load telemetry summary" }, { status: 500 });
  }
}
