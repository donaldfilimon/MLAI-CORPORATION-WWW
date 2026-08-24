import { OAuth2Client, type TokenPayload } from "google-auth-library";

declare global {
  var __quesarSchedulerOauth: OAuth2Client | undefined;
}

function oauthClient() {
  globalThis.__quesarSchedulerOauth ??= new OAuth2Client();
  return globalThis.__quesarSchedulerOauth;
}

export function validSchedulerClaims(
  payload: Pick<TokenPayload, "email" | "email_verified"> | undefined,
  expectedServiceAccount = process.env.AUDIT_SCHEDULER_SERVICE_ACCOUNT,
) {
  const expected = expectedServiceAccount?.trim().toLowerCase();
  return Boolean(
    expected &&
    payload?.email_verified === true &&
    typeof payload.email === "string" &&
    payload.email.toLowerCase() === expected,
  );
}

export async function verifyAuditSchedulerRequest(req: Request) {
  const audience = process.env.AUDIT_SCHEDULER_AUDIENCE?.trim();
  const authorization = req.headers.get("authorization") ?? "";
  if (!audience || !authorization.startsWith("Bearer ")) return false;
  const idToken = authorization.slice("Bearer ".length).trim();
  if (!idToken) return false;
  try {
    const ticket = await oauthClient().verifyIdToken({ idToken, audience });
    return validSchedulerClaims(ticket.getPayload());
  } catch (error) {
    console.error("Audit scheduler authentication failed:", error instanceof Error ? error.message : "unknown error");
    return false;
  }
}
