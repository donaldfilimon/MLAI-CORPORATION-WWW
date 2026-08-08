import { redirect } from "next/navigation";
import { requireWorkOS, CLIENT_ID, REDIRECT_URI, getReturnTo } from "@/lib/server/workos";
import { rateLimit, tooMany } from "@/lib/server/rate-limit";

/**
 * The AuthKit entry redirect, shared by `/api/auth/login` and
 * `/api/auth/signup`.
 *
 * Those two route files were byte-identical apart from `screenHint`, which
 * meant every property that actually matters — the rate-limit window, the
 * unconfigured-WorkOS fallback, and the `getReturnTo` open-redirect guard
 * pinned by workos-admin.test.ts — existed in two places and could drift
 * silently. `screenHint` is the only real difference, so it is the only
 * parameter.
 */
export function authKitEntry(screenHint: "sign-in" | "sign-up") {
  return async function GET(req: Request) {
    // Both entry points share one bucket on purpose: they are the same
    // credential-stuffing surface, so the budget should be shared too.
    if (!rateLimit("auth", req, { windowMs: 15 * 60 * 1000, max: 100 })) return tooMany();
    const auth = requireWorkOS();
    if (!auth || !CLIENT_ID) redirect("/login?error=auth_not_configured");

    const url = new URL(req.url);
    const redirectUrl = auth.userManagement.getAuthorizationUrl({
      provider: "authkit",
      redirectUri: REDIRECT_URI,
      clientId: CLIENT_ID,
      state: getReturnTo(url.searchParams.get("returnTo")),
      screenHint,
    });
    redirect(redirectUrl);
  };
}
