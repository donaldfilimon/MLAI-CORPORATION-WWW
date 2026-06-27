import { getSession, toPublicUser } from "@/lib/server/session";
import { getLlmStatus } from "@/lib/server/llm";

export async function GET(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  return Response.json({
    ok: true,
    user: toPublicUser(user),
    llm: getLlmStatus(),
  });
}
