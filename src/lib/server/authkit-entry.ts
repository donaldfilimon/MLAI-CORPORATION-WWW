import { redirect } from "next/navigation";
import {
  requireWorkOS,
  CLIENT_ID,
  REDIRECT_URI,
  getReturnTo,
  authStateCookie,
  createAuthStateNonce,
  encodeAuthState,
} from "@/lib/server/workos";
import { rateLimit, tooMany } from "@/lib/server/rate-limit";

/**
 * The AuthKit entry redirect, shared by `/api/auth/login` and
 * `/api/auth/signup`.
 *
 * Those two route files were byte-identical apart from `screenHint`, which
 * meant every property that actually matters — the rate-limit window, the
 * unconfigured-WorkOS fallback, the `getReturnTo` open-redirect guard, and now
 * the login-CSRF state nonce, all pinned by workos-admin.test.ts — existed in
 * two places and could drift silently. `screenHint` is the only real
 * difference, so it is the only parameter.
 */
export function authKitEntry(screenHint: "sign-in" | "sign-up") {
  return async function GET(req: Request) {
    // Both entry points share one bucket on purpose: they are the same
    // credential-stuffing surface, so the budget should be shared too.
    if (!rateLimit("auth", req, { windowMs: 15 * 60 * 1000, max: 100 })) return tooMany();
    const auth = requireWorkOS();
    if (!auth || !CLIENT_ID) redirect("/login?error=auth_not_configured");

    const url = new URL(req.url);
    // Mint the login-CSRF nonce here, at the one point where we know the flow
    // was started by this browser: it goes out inside `state` and, below, into
    // a cookie only this browser will hold. See workos.ts for the attack.
    const nonce = createAuthStateNonce();
    const redirectUrl = auth.userManagement.getAuthorizationUrl({
      provider: "authkit",
      redirectUri: REDIRECT_URI,
      clientId: CLIENT_ID,
      state: encodeAuthState(nonce, getReturnTo(url.searchParams.get("returnTo"))),
      screenHint,
    });

    // A constructed Response rather than next/navigation's redirect() for this
    // one hop: the nonce cookie has to ride on this exact response, and
    // redirect() throws a control-flow signal with nowhere to attach a header.
    // Status 307 matches what redirect() emitted, so nothing downstream (the
    // `bun run smoke` 3xx assertion included) sees a different shape.
    // no-store because this response carries a per-browser secret: a shared
    // cache is otherwise permitted to store it, and one cached login response
    // would hand every visitor the same nonce — turning the CSRF fix into a
    // CSRF hole. Nothing in the current deployment caches it; the directive is
    // what keeps that true if one ever sits in front.
    return new Response(null, {
      status: 307,
      headers: {
        Location: redirectUrl,
        "Set-Cookie": authStateCookie(nonce),
        "Cache-Control": "no-store",
      },
    });
  };
}
