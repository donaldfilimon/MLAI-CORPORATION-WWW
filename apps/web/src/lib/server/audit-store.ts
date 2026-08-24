import { randomUUID } from "node:crypto";
import type { ChatMessage } from "./llm";
import type { SessionData } from "./session";
import {
  auditSubjectHash,
  decryptAuditPayload,
  encryptAuditPayload,
  type EncryptedAuditPayload,
} from "./audit-crypto";
import { CHAT_AUDIT_POLICY_VERSION } from "./consent";
import { ensureDatabase } from "./db";
import type { Sql, TransactionSql } from "postgres";

export const AUDIT_RETENTION_DAYS = 365;

export type ConversationAuditContent = {
  messages: ChatMessage[];
  response: { provider: string; model: string; text: string };
};

type AuditRow = {
  id: string;
  subject_hash: string;
  organization_id: string;
  provider: string;
  model: string;
  policy_version: string;
  ciphertext: Buffer;
  iv: Buffer;
  auth_tag: Buffer;
  wrapped_key: Buffer;
  kms_key_version: string;
  aad: string;
  content_digest: string;
  created_at: Date;
  expires_at: Date;
};

function encryptedFromRow(row: AuditRow): EncryptedAuditPayload {
  return {
    ciphertext: row.ciphertext,
    iv: row.iv,
    authTag: row.auth_tag,
    wrappedKey: row.wrapped_key,
    kmsKeyVersion: row.kms_key_version,
    aad: row.aad,
    contentDigest: row.content_digest,
  };
}

export async function recordConversationAudit(
  user: SessionData,
  messages: ChatMessage[],
  response: ConversationAuditContent["response"],
) {
  if (!user.organizationId) throw new Error("An active organization is required");
  const id = randomUUID();
  const subjectHash = auditSubjectHash(user.userId);
  const encrypted = await encryptAuditPayload({ messages, response }, id);
  const sql = await ensureDatabase();
  const rows = await sql<Array<{ created_at: Date; expires_at: Date }>>`
    INSERT INTO conversation_audits (
      id, subject_hash, organization_id, provider, model, policy_version,
      ciphertext, iv, auth_tag, wrapped_key, kms_key_version, aad, content_digest,
      expires_at
    ) VALUES (
      ${id}, ${subjectHash}, ${user.organizationId}, ${response.provider}, ${response.model},
      ${CHAT_AUDIT_POLICY_VERSION}, ${encrypted.ciphertext}, ${encrypted.iv},
      ${encrypted.authTag}, ${encrypted.wrappedKey}, ${encrypted.kmsKeyVersion},
      ${encrypted.aad}, ${encrypted.contentDigest},
      NOW() + (${AUDIT_RETENTION_DAYS} * INTERVAL '1 day')
    ) RETURNING created_at, expires_at`;
  const inserted = rows[0];
  if (!inserted) throw new Error("Conversation audit insert returned no row");
  return {
    id,
    createdAt: inserted.created_at.toISOString(),
    expiresAt: inserted.expires_at.toISOString(),
  };
}

export async function listConversationAudits(user: SessionData) {
  const sql = await ensureDatabase();
  const subjectHash = auditSubjectHash(user.userId);
  const rows = await sql<AuditRow[]>`SELECT * FROM conversation_audits
    WHERE subject_hash = ${subjectHash} AND expires_at > NOW()
    ORDER BY created_at DESC LIMIT 200`;
  return rows.map((row) => ({
    id: row.id,
    provider: row.provider,
    model: row.model,
    policyVersion: row.policy_version,
    createdAt: row.created_at.toISOString(),
    expiresAt: row.expires_at.toISOString(),
  }));
}

export async function listAdminConversationAudits(args: {
  user: SessionData;
  organizationId: string;
  reason: string;
}) {
  const sql = await ensureDatabase();
  const actorHash = auditSubjectHash(args.user.userId);
  await accessEvent({ auditId: null, actorHash, actorType: "admin", action: "list", outcome: "requested", reason: args.reason });
  try {
    const rows = await sql<AuditRow[]>`SELECT * FROM conversation_audits
      WHERE organization_id = ${args.organizationId} AND expires_at > NOW()
      ORDER BY created_at DESC LIMIT 200`;
    await accessEvent({ auditId: null, actorHash, actorType: "admin", action: "list", outcome: "succeeded", reason: args.reason });
    return rows.map((row) => ({
      id: row.id,
      provider: row.provider,
      model: row.model,
      policyVersion: row.policy_version,
      createdAt: row.created_at.toISOString(),
      expiresAt: row.expires_at.toISOString(),
      subjectHash: row.subject_hash,
      organizationId: row.organization_id,
    }));
  } catch (error) {
    await accessEvent({ auditId: null, actorHash, actorType: "admin", action: "list", outcome: "failed", reason: args.reason });
    throw error;
  }
}

async function accessEvent(args: {
  auditId: string | null;
  actorHash: string;
  actorType: "user" | "admin" | "system";
  action: "list" | "read" | "export" | "delete" | "expire";
  outcome: "requested" | "succeeded" | "failed";
  reason?: string;
}, connection?: Sql | TransactionSql) {
  const sql = connection ?? await ensureDatabase();
  await sql`INSERT INTO audit_access_events (
    audit_id, actor_subject_hash, actor_type, action, reason, outcome
  ) VALUES (
    ${args.auditId}, ${args.actorHash}, ${args.actorType}, ${args.action},
    ${args.reason ?? null}, ${args.outcome}
  )`;
}

export async function readConversationAudit(args: {
  id: string;
  user: SessionData;
  admin?: boolean;
  reason?: string;
  action?: "read" | "export";
}) {
  const sql = await ensureDatabase();
  const actorHash = auditSubjectHash(args.user.userId);
  const action = args.action ?? "read";
  const actorType = args.admin ? "admin" : "user";
  await accessEvent({ auditId: args.id, actorHash, actorType, action, outcome: "requested", reason: args.reason });
  try {
    const rows = args.admin
      ? await sql<AuditRow[]>`SELECT * FROM conversation_audits
          WHERE id = ${args.id} AND organization_id = ${args.user.organizationId ?? ""}
            AND expires_at > NOW() LIMIT 1`
      : await sql<AuditRow[]>`SELECT * FROM conversation_audits
          WHERE id = ${args.id} AND subject_hash = ${actorHash}
            AND expires_at > NOW() LIMIT 1`;
    const row = rows[0];
    if (!row) {
      await accessEvent({ auditId: args.id, actorHash, actorType, action, outcome: "failed", reason: args.reason });
      return null;
    }
    const content = await decryptAuditPayload<ConversationAuditContent>(encryptedFromRow(row), row.id);
    await accessEvent({ auditId: args.id, actorHash, actorType, action, outcome: "succeeded", reason: args.reason });
    return {
      id: row.id,
      provider: row.provider,
      model: row.model,
      policyVersion: row.policy_version,
      createdAt: row.created_at.toISOString(),
      expiresAt: row.expires_at.toISOString(),
      content,
    };
  } catch (error) {
    await accessEvent({ auditId: args.id, actorHash, actorType, action, outcome: "failed", reason: args.reason });
    throw error;
  }
}

export async function deleteOwnConversationAudit(id: string, user: SessionData): Promise<boolean> {
  const sql = await ensureDatabase();
  const actorHash = auditSubjectHash(user.userId);
  try {
    return await sql.begin(async (tx) => {
      const owned = await tx<Array<{ id: string }>>`SELECT id FROM conversation_audits
        WHERE id = ${id} AND subject_hash = ${actorHash} AND expires_at > NOW()
        FOR UPDATE`;
      if (!owned.length) return false;
      await accessEvent({ auditId: id, actorHash, actorType: "user", action: "delete", outcome: "requested" }, tx);
      await tx`DELETE FROM conversation_audits WHERE id = ${id}`;
      await accessEvent({ auditId: id, actorHash, actorType: "user", action: "delete", outcome: "succeeded" }, tx);
      return true;
    });
  } catch (error) {
    try {
      await accessEvent({ auditId: id, actorHash, actorType: "user", action: "delete", outcome: "failed" });
    } catch (logError) {
      console.error("Audit deletion failure could not be logged:", logError);
    }
    throw error;
  }
}

export async function expireConversationAudits(): Promise<number> {
  const sql = await ensureDatabase();
  return sql.begin(async (tx) => {
    const rows = await tx<Array<{ id: string; subject_hash: string }>>`
      DELETE FROM conversation_audits WHERE expires_at <= NOW()
      RETURNING id, subject_hash`;
    for (const row of rows) {
      await accessEvent({
        auditId: row.id,
        actorHash: row.subject_hash,
        actorType: "system",
        action: "expire",
        outcome: "succeeded",
        reason: "one-year retention policy",
      }, tx);
    }
    return rows.length;
  });
}
