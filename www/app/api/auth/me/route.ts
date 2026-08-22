import { getSession, toPublicUser } from "@/lib/server/session";

export async function GET(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ user: null }, { status: 200 });
  return Response.json({ user: toPublicUser(user) });
}
