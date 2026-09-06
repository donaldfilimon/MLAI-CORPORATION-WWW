/**
 * Finish the OAuth flow: verify the CSRF nonce, exchange the code, store the
 * refresh token encrypted, and return the user to the console.
 *
 * The nonce is single-use — every terminal path clears the cookie, so a failed
 * or abandoned attempt cannot leave a live nonce for a later forged callback.
 * The gate clears before the code is spent, matching /api/auth/callback.
 */
import { rateLimit, tooMany } from "@/lib/server/rate-limit";
import { gateWorkspaceRequest } from "@/lib/server/workspace-route";
import {
  clearWorkspaceStateCookie,
  decodeWorkspaceState,
  exchangeAuthorizationCode,
  isWorkspaceProvider,
  providerCredentials,
  readPendingFlow,
  timingSafeEqualString,
} from "@/lib/server/workspace-oauth";
import { fetchAccountEmail } from "@/lib/server/workspace-remote";
import { saveWorkspaceConnection } from "@/lib/server/workspace-tokens";
import { redirectToFrontend } from "@/lib/server/workos";

function finish(query: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectToFrontend(`/console/workspace${query}`),
      "Set-Cookie": clearWorkspaceStateCookie(),
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: Request, context: { params: Promise<{ provider: string }> }) {
  const gate = await gateWorkspaceRequest(req);
  if (!gate.ok) return gate.response;

  if (!rateLimit("workspace-callback", req, { windowMs: 60 * 1000, max: 10 })) return tooMany();

  const { provider } = await context.params;
  if (!isWorkspaceProvider(provider)) return finish("?error=unknown_provider");

  const url = new URL(req.url);
  const denied = url.searchParams.get("error");
  if (denied) return finish(`?error=${encodeURIComponent(denied)}`);

  const code = url.searchParams.get("code");
  if (!code) return finish("?error=missing_code");

  // CSRF gate. An attacker can navigate this browser here with their own
  // authorization code; they cannot set the pending-flow cookie. The flow also
  // has to be for THIS provider, so a Google callback cannot consume a pending
  // Microsoft flow (and spend its PKCE verifier).
  const state = decodeWorkspaceState(url.searchParams.get("state"));
  const pending = readPendingFlow(req);
  if (
    !state ||
    !pending ||
    state.provider !== provider ||
    pending.provider !== provider ||
    !timingSafeEqualString(state.nonce, pending.nonce)
  ) {
    console.warn("[Workspace] Rejected callback: missing or mismatched state nonce");
    return finish("?error=invalid_state");
  }

  const credentials = providerCredentials(provider);
  if (!credentials) return finish("?error=provider_not_configured");

  try {
    const tokens = await exchangeAuthorizationCode(provider, credentials, code, pending.verifier);
    if (!tokens.refreshToken) {
      // Without a refresh token the connection dies when the access token
      // expires. Say so rather than storing something that stops working.
      return finish("?error=no_refresh_token");
    }
    const accountEmail = await fetchAccountEmail(
      provider === "google" ? "google-drive" : "sharepoint",
      tokens.accessToken,
    );
    await saveWorkspaceConnection({
      userId: gate.user.userId,
      provider,
      refreshToken: tokens.refreshToken,
      accountEmail,
      scope: tokens.scope,
    });
    return finish(`?connected=${provider}`);
  } catch (error) {
    // Message only — never the response body, which can echo the code.
    console.error("[Workspace] Connection failed:", error instanceof Error ? error.message : error);
    return finish("?error=connection_failed");
  }
}
