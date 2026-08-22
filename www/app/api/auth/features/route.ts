import { requireWorkOS, CLIENT_ID } from "@/lib/server/workos";

export async function GET() {
  return Response.json({
    authkit: Boolean(requireWorkOS() && CLIENT_ID),
    cookies: {
      name: "mlai_session",
      httpOnly: true,
      sameSite: "Lax",
      secureInProduction: true,
      maxAgeDays: 7,
    },
    capabilities: {
      signIn: true,
      signUp: true,
      autoLogin: true,
      mfa: "Configure MFA policies in the WorkOS dashboard for this AuthKit environment.",
      passkeys:
        "Enable passkeys in the WorkOS dashboard; hosted AuthKit will present them automatically when available.",
    },
  });
}
