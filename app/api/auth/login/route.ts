import { redirect } from "next/navigation";
import { requireWorkOS, CLIENT_ID, REDIRECT_URI, getReturnTo } from "@/lib/server/workos";
import { rateLimit, tooMany } from "@/lib/server/rate-limit";

export async function GET(req: Request) {
  if (!rateLimit("auth", req, { windowMs: 15 * 60 * 1000, max: 100 })) return tooMany();
  const auth = requireWorkOS();
  if (!auth || !CLIENT_ID) redirect("/login?error=auth_not_configured");

  const url = new URL(req.url);
  const redirectUrl = auth.userManagement.getAuthorizationUrl({
    provider: "authkit",
    redirectUri: REDIRECT_URI,
    clientId: CLIENT_ID,
    state: getReturnTo(url.searchParams.get("returnTo")),
    screenHint: "sign-in",
  });
  redirect(redirectUrl);
}
