/**
 * Drop a stored connection, revoking the grant at the provider first where that
 * is possible.
 *
 * Consumes no request body, so no body limit applies. POST rather than GET
 * because it mutates and must not be prefetchable; cross-site POSTs cannot
 * carry the session cookie, which is SameSite=Lax.
 */
import { rateLimit, tooMany } from "@/lib/server/rate-limit";
import { gateWorkspaceRequest, PRIVATE_NO_STORE } from "@/lib/server/workspace-route";
import { isWorkspaceProvider } from "@/lib/server/workspace-oauth";
import { revokeAndDeleteWorkspaceConnection } from "@/lib/server/workspace-tokens";

export async function POST(req: Request, context: { params: Promise<{ provider: string }> }) {
  const gate = await gateWorkspaceRequest(req);
  if (!gate.ok) return gate.response;

  if (!rateLimit("workspace-disconnect", req, { windowMs: 60 * 1000, max: 20 })) return tooMany();

  const { provider } = await context.params;
  if (!isWorkspaceProvider(provider)) {
    return Response.json({ error: "Unknown provider" }, { status: 400, headers: PRIVATE_NO_STORE });
  }

  try {
    const result = await revokeAndDeleteWorkspaceConnection(gate.user.userId, provider);
    return Response.json({ ok: true, ...result }, { headers: PRIVATE_NO_STORE });
  } catch (error) {
    console.error("[Workspace] Disconnect failed:", error);
    return Response.json(
      { error: "Could not disconnect" },
      { status: 503, headers: PRIVATE_NO_STORE },
    );
  }
}
