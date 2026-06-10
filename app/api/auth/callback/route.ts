import { requireWorkOS, CLIENT_ID, redirectToFrontend } from "@/lib/server/workos";
import { setSessionCookie } from "@/lib/server/session";

export async function GET(req: Request) {
  const auth = requireWorkOS();
  if (!auth || !CLIENT_ID) {
    return Response.redirect(redirectToFrontend("/login?error=auth_not_configured"), 302);
  }

  const url = new URL(req.url);
  const error = url.searchParams.get("error");
  if (error) {
    return Response.redirect(
      redirectToFrontend(`/login?error=${encodeURIComponent(error)}`),
      302,
    );
  }

  const code = url.searchParams.get("code");
  if (!code) return Response.redirect(redirectToFrontend("/login?error=missing_code"), 302);

  try {
    const { user, accessToken, refreshToken, organizationId, authenticationMethod } =
      await auth.userManagement.authenticateWithCode({ code, clientId: CLIENT_ID });

    const cookie = await setSessionCookie(req, {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.profilePictureUrl ?? null,
      organizationId: organizationId ?? null,
      authenticationMethod: authenticationMethod ?? null,
      accessToken,
      refreshToken,
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectToFrontend(url.searchParams.get("state") ?? undefined),
        "Set-Cookie": cookie,
      },
    });
  } catch (err) {
    console.error("WorkOS auth error:", err);
    return Response.redirect(redirectToFrontend("/login?error=auth_failed"), 302);
  }
}
