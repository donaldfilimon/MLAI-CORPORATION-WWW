import { getSession, setSessionCookie, toPublicUser } from "@/lib/server/session";
import { requireWorkOS } from "@/lib/server/workos";

export async function PATCH(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const auth = requireWorkOS();
  if (!auth) return Response.json({ error: "WorkOS is not configured" }, { status: 503 });

  let body: { firstName?: string; lastName?: string; company?: string; useCase?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const firstName =
    typeof body.firstName === "string" ? body.firstName.trim().slice(0, 80) : undefined;
  const lastName =
    typeof body.lastName === "string" ? body.lastName.trim().slice(0, 80) : undefined;
  const company =
    typeof body.company === "string" ? body.company.trim().slice(0, 120) : undefined;
  const useCase =
    typeof body.useCase === "string" ? body.useCase.trim().slice(0, 240) : undefined;

  try {
    const updated = await auth.userManagement.updateUser({
      userId: user.userId,
      firstName,
      lastName,
      metadata: {
        company: company || null,
        use_case: useCase || null,
      },
    });

    const cookie = await setSessionCookie(req, {
      ...user,
      firstName: updated.firstName,
      lastName: updated.lastName,
      avatarUrl: updated.profilePictureUrl ?? user.avatarUrl ?? null,
    });

    return Response.json(
      {
        ok: true,
        user: toPublicUser({ ...user, firstName: updated.firstName, lastName: updated.lastName }),
      },
      { headers: { "Set-Cookie": cookie } },
    );
  } catch (err) {
    console.error("WorkOS profile update error:", err);
    return Response.json({ error: "Profile update failed" }, { status: 502 });
  }
}
