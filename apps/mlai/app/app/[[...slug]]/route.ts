import { createAuth } from "@mlai/store";
import { renderWorkspace } from "../../../lib/workspace";

export const dynamic = "force-dynamic";

function refused() {
  return new Response("Sign in required.", {
    status: 401,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export async function GET(request: Request) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return refused();
  const { auth } = createAuth(connectionString);
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.match(/(?:^|;\s*)better-auth\.session_token=([^;]+)/)?.[1] ?? null;
  const result = await renderWorkspace(auth, token);
  if (result.status !== 200) return refused();
  return new Response(result.body, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
