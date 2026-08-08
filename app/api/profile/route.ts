import { payloadTooLarge, readBodyLimited } from "@/lib/server/body-limit";
import { getSession, setSessionCookie, toPublicUser } from "@/lib/server/session";
import { requireWorkOS } from "@/lib/server/workos";

export async function PATCH(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const auth = requireWorkOS();
  if (!auth) return Response.json({ error: "WorkOS is not configured" }, { status: 503 });

  // 16 KB cap: a handful of short profile fields.
  const raw = await readBodyLimited(req, 16 * 1024);
  if (raw === null) return payloadTooLarge();
  let body: { firstName?: string; lastName?: string; company?: string; useCase?: string };
  try {
    body = JSON.parse(raw) as {
      firstName?: string;
      lastName?: string;
      company?: string;
      useCase?: string;
    };
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

  // PATCH is a partial update: an absent key means "leave unchanged", which is
  // what passing `undefined` achieves for firstName/lastName. Metadata needs the
  // same policy built explicitly — sending `{ company: null }` for a key the
  // caller never mentioned WIPES the stored value, so `PATCH {"firstName":"X"}`
  // used to erase company and use_case. Only include keys actually present, and
  // omit `metadata` entirely when neither is.
  const metadata: Record<string, string | null> = {};
  if (company !== undefined) metadata.company = company || null;
  if (useCase !== undefined) metadata.use_case = useCase || null;

  try {
    const updated = await auth.userManagement.updateUser({
      userId: user.userId,
      firstName,
      lastName,
      ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
    });

    const nextUser = {
      ...user,
      firstName: updated.firstName,
      lastName: updated.lastName,
      avatarUrl: updated.profilePictureUrl ?? user.avatarUrl ?? null,
      company: updated.metadata?.company ?? null,
      useCase: updated.metadata?.use_case ?? null,
    };

    const cookie = await setSessionCookie(req, nextUser);

    return Response.json(
      { ok: true, user: toPublicUser(nextUser) },
      { headers: { "Set-Cookie": cookie } },
    );
  } catch (err) {
    console.error("WorkOS profile update error:", err);
    return Response.json({ error: "Profile update failed" }, { status: 502 });
  }
}
