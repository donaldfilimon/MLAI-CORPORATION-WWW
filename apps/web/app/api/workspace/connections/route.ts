/**
 * Which providers this user has connected, and which are even available.
 *
 * `configured` reflects server credentials; `connected` reflects this user.
 * The console needs both: an unconfigured provider offers no Connect button,
 * while a configured-but-unconnected one does.
 */
import { gateWorkspaceRequest, PRIVATE_NO_STORE } from "@/lib/server/workspace-route";
import {
  WORKSPACE_PROVIDERS,
  isProviderConfigured,
  providerLabel,
} from "@/lib/server/workspace-oauth";
import { listWorkspaceConnections } from "@/lib/server/workspace-tokens";

export async function GET(req: Request) {
  const gate = await gateWorkspaceRequest(req);
  if (!gate.ok) return gate.response;

  try {
    const connections = await listWorkspaceConnections(gate.user.userId);
    const byProvider = new Map(connections.map((row) => [row.provider, row]));
    return Response.json(
      {
        ok: true,
        providers: WORKSPACE_PROVIDERS.map((provider) => {
          const row = byProvider.get(provider);
          return {
            provider,
            label: providerLabel(provider),
            configured: isProviderConfigured(provider),
            connected: Boolean(row),
            accountEmail: row?.accountEmail ?? null,
            connectedAt: row?.connectedAt ?? null,
          };
        }),
      },
      { headers: PRIVATE_NO_STORE },
    );
  } catch (error) {
    console.error("[Workspace] Connection list failed:", error);
    return Response.json(
      { error: "Connections unavailable" },
      { status: 503, headers: PRIVATE_NO_STORE },
    );
  }
}
