import { getSession, toPublicUser } from "@/lib/server/session";
import { requireWorkOS } from "@/lib/server/workos";

export async function GET(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const auth = requireWorkOS();
  if (!auth) return Response.json({ error: "WorkOS is not configured" }, { status: 503 });

  try {
    const workosUser = await auth.userManagement.getUser(user.userId);
    return Response.json({
      ok: true,
      user: toPublicUser(user),
      workos: {
        id: workosUser.id,
        email: workosUser.email,
        emailVerified: workosUser.emailVerified,
        firstName: workosUser.firstName,
        lastName: workosUser.lastName,
        profilePictureUrl: workosUser.profilePictureUrl,
        createdAt: workosUser.createdAt,
        updatedAt: workosUser.updatedAt,
      },
    });
  } catch (err) {
    console.error("WorkOS user verification error:", err);
    return Response.json({ error: "User could not be verified with WorkOS" }, { status: 502 });
  }
}
