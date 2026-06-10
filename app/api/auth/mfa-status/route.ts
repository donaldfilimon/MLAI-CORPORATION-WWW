import { getSession } from "@/lib/server/session";
import { requireWorkOS, ADMIN_REQUIRE_MFA, type FactorListing } from "@/lib/server/workos";

export async function GET(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const auth = requireWorkOS();
  if (!auth) {
    return Response.json({
      ok: true,
      configured: false,
      adminEnforcement: ADMIN_REQUIRE_MFA,
      factors: [],
    });
  }

  try {
    const um = auth.userManagement as unknown as FactorListing;
    const factors = await um.listUserAuthFactors({ userId: user.userId });
    return Response.json({
      ok: true,
      configured: true,
      adminEnforcement: ADMIN_REQUIRE_MFA,
      authenticationMethod: user.authenticationMethod ?? null,
      factors: factors.data.map((f) => ({ id: f.id, type: f.type, createdAt: f.createdAt })),
    });
  } catch (err) {
    console.error("WorkOS listUserAuthFactors failed:", err);
    return Response.json({ error: "Failed to load MFA status" }, { status: 502 });
  }
}
