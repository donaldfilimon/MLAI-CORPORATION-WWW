import { redirect } from "next/navigation";

// Quesar is an invite-only beta. This legacy route remains so old links do not
// 404, but it no longer opens WorkOS self-signup.
export function GET() {
  redirect("/login?mode=request-access");
}
