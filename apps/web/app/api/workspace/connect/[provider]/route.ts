/**
 * Start the OAuth flow for one provider.
 *
 * Mints a single-use nonce plus a PKCE verifier, stores both in an HttpOnly
 * cookie bound to the provider, and redirects to the provider's consent
 * screen. Nothing is written to the database until the callback succeeds.
 */
import { randomBytes } from "node:crypto";
import { rateLimit, tooMany } from "@/lib/server/rate-limit";
import { gateWorkspaceRequest } from "@/lib/server/workspace-route";
import {
  buildAuthorizeUrl,
  createPkceVerifier,
  encodePendingFlow,
  encodeWorkspaceState,
  isWorkspaceProvider,
  pkceChallenge,
  providerCredentials,
  workspaceStateCookie,
} from "@/lib/server/workspace-oauth";
import { redirectToFrontend } from "@/lib/server/workos";

function back(error: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectToFrontend(`/console/workspace?error=${encodeURIComponent(error)}`),
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: Request, context: { params: Promise<{ provider: string }> }) {
  const gate = await gateWorkspaceRequest(req);
  if (!gate.ok) return gate.response;

  if (!rateLimit("workspace-connect", req, { windowMs: 60 * 1000, max: 10 })) return tooMany();

  const { provider } = await context.params;
  if (!isWorkspaceProvider(provider)) return back("unknown_provider");

  const credentials = providerCredentials(provider);
  if (!credentials) return back("provider_not_configured");

  const nonce = randomBytes(32).toString("base64url");
  const verifier = createPkceVerifier();
  const state = encodeWorkspaceState(nonce, provider);

  return new Response(null, {
    status: 302,
    headers: {
      Location: buildAuthorizeUrl(provider, credentials, state, pkceChallenge(verifier)),
      "Set-Cookie": workspaceStateCookie(encodePendingFlow({ nonce, verifier, provider })),
      "Cache-Control": "no-store",
    },
  });
}
