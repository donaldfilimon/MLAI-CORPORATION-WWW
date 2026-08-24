import {
  requireWorkOS,
  CLIENT_ID,
  redirectToFrontend,
  clearAuthStateCookie,
  decodeAuthState,
  readAuthStateNonce,
  timingSafeEqualString,
  checkOrganizationAccess,
  accessTokenAuthTime,
} from "@/lib/server/workos";
import { setSessionCookie } from "@/lib/server/session";

/**
 * Every terminal failure clears the state nonce. The nonce is single-use: a
 * failed attempt must not leave a live one behind for a later forged callback
 * to match against, and a user who abandons the flow should not keep one.
 */
function failRedirect(error: string) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectToFrontend(`/login?error=${encodeURIComponent(error)}`),
      "Set-Cookie": clearAuthStateCookie(),
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: Request) {
  const auth = requireWorkOS();
  if (!auth || !CLIENT_ID) {
    return Response.redirect(redirectToFrontend("/login?error=auth_not_configured"), 302);
  }

  const url = new URL(req.url);
  const error = url.searchParams.get("error");
  if (error) return failRedirect(error);

  const code = url.searchParams.get("code");
  if (!code) return failRedirect("missing_code");

  // Login CSRF gate — this has to clear before the `code` is spent, not after.
  // An attacker can hand us a valid authorization `code` (their own, harvested
  // from a sign-in they started) by navigating the victim's browser here; what
  // they cannot do is set a cookie in that browser. So the `state` we minted at
  // /api/auth/login has to carry a nonce matching the one this browser holds.
  //
  // decodeAuthState returns null rather than throwing for anything unexpected —
  // a truncated or hand-rolled `state`, or the pre-nonce plain-path `state` an
  // in-flight login started before this change would still be echoing back — so
  // all of those land on the ordinary error redirect instead of a 500.
  const state = decodeAuthState(url.searchParams.get("state"));
  const expectedNonce = readAuthStateNonce(req);
  if (!state || !expectedNonce || !timingSafeEqualString(state.nonce, expectedNonce)) {
    console.warn("[Auth] Rejected callback: missing or mismatched state nonce");
    return failRedirect("invalid_state");
  }

  try {
    const { user, accessToken, refreshToken, organizationId, authenticationMethod } =
      await auth.userManagement.authenticateWithCode({ code, clientId: CLIENT_ID });

    const candidate = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.profilePictureUrl ?? null,
      company: user.metadata?.company ?? null,
      useCase: user.metadata?.use_case ?? null,
      organizationId: organizationId ?? null,
      authenticationMethod: authenticationMethod ?? null,
      // `auth_time` advances only after active authentication. Callback time
      // does not: AuthKit can complete a code exchange from an existing SSO
      // session, so stamping Date.now() here would manufacture freshness.
      authenticatedAt: accessTokenAuthTime(accessToken) ?? undefined,
      accessToken,
      refreshToken,
    };
    const access = await checkOrganizationAccess(candidate);
    if (!access.ok) return failRedirect("organization_access_required");
    const cookie = await setSessionCookie(req, {
      ...candidate,
      organizationId: access.organizationId,
    });

    // Two Set-Cookie values, so a Headers instance with append() — an object
    // literal can only carry one and would silently drop the other. (Dropping
    // the session cookie would break login outright; dropping the clear would
    // leave a spent nonce live. workos-admin.test.ts pins that append keeps
    // both.) no-store for the same reason as the login entry: this response
    // sets a session cookie and must never be served from a shared cache.
    const headers = new Headers({
      Location: redirectToFrontend(state.returnTo),
      "Cache-Control": "no-store",
    });
    headers.append("Set-Cookie", cookie);
    headers.append("Set-Cookie", clearAuthStateCookie());
    return new Response(null, { status: 302, headers });
  } catch (err) {
    console.error("WorkOS auth error:", err);
    return failRedirect("auth_failed");
  }
}
