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
 * The single AuthKit sign-in entry. Quesar is invite-only, so `/api/auth/signup`
 * redirects to the request-access funnel and must never call this helper.
 */
export function authKitEntry() {
  return async function GET(req: Request) {
    // Keep the hosted credential entry behind its own stuffing budget.
    if (!rateLimit("auth", req, { windowMs: 15 * 60 * 1000, max: 100 })) return tooMany();
    const auth = requireWorkOS();
    if (!auth || !CLIENT_ID) redirect("/login?error=auth_not_configured");

    const url = new URL(req.url);
    // Mint the login-CSRF nonce here, at the one point where we know the flow
    // was started by this browser: it goes out inside `state` and, below, into
    // a cookie only this browser will hold. See workos.ts for the attack.
    const nonce = createAuthStateNonce();
    const redirectUrl = new URL(auth.userManagement.getAuthorizationUrl({
      provider: "authkit",
      redirectUri: REDIRECT_URI,
      clientId: CLIENT_ID,
      state: encodeAuthState(nonce, getReturnTo(url.searchParams.get("returnTo"))),
      screenHint: "sign-in",
    }));

    // WorkOS step-up authentication uses max_age together with the access
    // token's auth_time claim. The installed SDK version does not yet expose
    // maxAge in its option type or serializer, so put the standard parameter
    // on the WorkOS authorization URL directly. This makes every sign-in
    // callback carry proof of authentication no more than ten minutes old;
    // sensitive admin endpoints independently enforce the same window.
    redirectUrl.searchParams.set("max_age", "600");

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
        Location: redirectUrl.toString(),
        "Set-Cookie": authStateCookie(nonce),
        "Cache-Control": "no-store",
      },
    });
  };
}
