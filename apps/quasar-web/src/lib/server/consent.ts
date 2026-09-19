import type { SessionData } from "./session";
import { auditSubjectHash } from "./audit-crypto";
import { ensureDatabase } from "./db";

export const CHAT_AUDIT_POLICY_VERSION = "2026-08-24.1";

function requireOrganization(user: SessionData): string {
  if (!user.organizationId) throw new Error("An active organization is required");
  return user.organizationId;
}

export async function getChatConsent(user: SessionData) {
  const sql = await ensureDatabase();
  const subjectHash = auditSubjectHash(user.userId);
  const rows = await sql<
    Array<{ consented_at: Date; withdrawn_at: Date | null; policy_version: string }>
  >`SELECT consented_at, withdrawn_at, policy_version
    FROM chat_consents
    WHERE subject_hash = ${subjectHash}
      AND policy_version = ${CHAT_AUDIT_POLICY_VERSION}
    LIMIT 1`;
  const consent = rows[0];
  return {
    policyVersion: CHAT_AUDIT_POLICY_VERSION,
    accepted: Boolean(consent && !consent.withdrawn_at),
    consentedAt: consent?.consented_at?.toISOString() ?? null,
    withdrawnAt: consent?.withdrawn_at?.toISOString() ?? null,
  };
}

export async function acceptChatConsent(user: SessionData) {
  const sql = await ensureDatabase();
  const subjectHash = auditSubjectHash(user.userId);
  const organizationId = requireOrganization(user);
  const rows = await sql<Array<{ consented_at: Date }>>`
    INSERT INTO chat_consents (
      subject_hash, organization_id, policy_version, consented_at, withdrawn_at, updated_at
    ) VALUES (
      ${subjectHash}, ${organizationId}, ${CHAT_AUDIT_POLICY_VERSION}, NOW(), NULL, NOW()
    )
    ON CONFLICT (subject_hash, policy_version) DO UPDATE SET
      organization_id = EXCLUDED.organization_id,
      consented_at = NOW(),
      withdrawn_at = NULL,
      updated_at = NOW()
    RETURNING consented_at`;
  const accepted = rows[0];
  if (!accepted) throw new Error("Consent insert returned no row");
  return {
    policyVersion: CHAT_AUDIT_POLICY_VERSION,
    consentedAt: accepted.consented_at.toISOString(),
  };
}

export async function withdrawChatConsent(user: SessionData): Promise<void> {
  const sql = await ensureDatabase();
  const subjectHash = auditSubjectHash(user.userId);
  await sql`UPDATE chat_consents
    SET withdrawn_at = NOW(), updated_at = NOW()
    WHERE subject_hash = ${subjectHash}
      AND policy_version = ${CHAT_AUDIT_POLICY_VERSION}`;
}
