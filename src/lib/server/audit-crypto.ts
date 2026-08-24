import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from "node:crypto";
import { KeyManagementServiceClient } from "@google-cloud/kms";

declare global {
  var __quesarKms: KeyManagementServiceClient | undefined;
}

export type EncryptedAuditPayload = {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
  wrappedKey: Buffer;
  kmsKeyVersion: string;
  aad: string;
  contentDigest: string;
};

export function auditSubjectHash(userId: string, pepper = process.env.AUDIT_SUBJECT_PEPPER): string {
  if (!pepper || pepper.length < 32) {
    throw new Error("AUDIT_SUBJECT_PEPPER (at least 32 characters) is required");
  }
  return createHmac("sha256", pepper).update(userId, "utf8").digest("hex");
}

function auditContentDigest(plaintext: Buffer, pepper = process.env.AUDIT_SUBJECT_PEPPER): string {
  if (!pepper || pepper.length < 32) {
    throw new Error("AUDIT_SUBJECT_PEPPER (at least 32 characters) is required");
  }
  return createHmac("sha256", pepper)
    .update("quesar-audit-content-digest:v1\0", "utf8")
    .update(plaintext)
    .digest("hex");
}

export function auditAad(auditId: string): string {
  return `quesar-conversation-audit:${auditId}:v1`;
}

export function encryptWithDataKey(
  plaintext: Buffer,
  dataKey: Buffer,
  aad: string,
): Pick<EncryptedAuditPayload, "ciphertext" | "iv" | "authTag"> {
  if (dataKey.length !== 32) throw new Error("Audit data keys must be 32 bytes");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", dataKey, iv);
  cipher.setAAD(Buffer.from(aad, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return { ciphertext, iv, authTag: cipher.getAuthTag() };
}

export function decryptWithDataKey(
  encrypted: Pick<EncryptedAuditPayload, "ciphertext" | "iv" | "authTag">,
  dataKey: Buffer,
  aad: string,
): Buffer {
  const decipher = createDecipheriv("aes-256-gcm", dataKey, encrypted.iv);
  decipher.setAAD(Buffer.from(aad, "utf8"));
  decipher.setAuthTag(encrypted.authTag);
  return Buffer.concat([decipher.update(encrypted.ciphertext), decipher.final()]);
}

function requireKmsKeyName(): string {
  const name = process.env.AUDIT_KMS_KEY_NAME?.trim();
  if (!name) throw new Error("AUDIT_KMS_KEY_NAME is required for conversation audits");
  return name;
}

function kms(): KeyManagementServiceClient {
  globalThis.__quesarKms ??= new KeyManagementServiceClient();
  return globalThis.__quesarKms;
}

export async function encryptAuditPayload(payload: unknown, auditId: string): Promise<EncryptedAuditPayload> {
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const contentDigest = auditContentDigest(plaintext);
  const aad = auditAad(auditId);
  const dataKey = randomBytes(32);
  const encrypted = encryptWithDataKey(plaintext, dataKey, aad);
  const keyName = requireKmsKeyName();

  try {
    const [wrapped] = await kms().encrypt({ name: keyName, plaintext: dataKey });
    if (!wrapped.ciphertext) throw new Error("Cloud KMS returned no wrapped data key");
    return {
      ...encrypted,
      wrappedKey: Buffer.from(wrapped.ciphertext as Uint8Array),
      kmsKeyVersion: wrapped.name ?? keyName,
      aad,
      contentDigest,
    };
  } finally {
    dataKey.fill(0);
  }
}

export async function decryptAuditPayload<T>(encrypted: EncryptedAuditPayload, auditId: string): Promise<T> {
  const expectedAad = auditAad(auditId);
  if (encrypted.aad !== expectedAad) throw new Error("Audit additional data mismatch");
  const [unwrapped] = await kms().decrypt({
    name: encrypted.kmsKeyVersion || requireKmsKeyName(),
    ciphertext: encrypted.wrappedKey,
  });
  if (!unwrapped.plaintext) throw new Error("Cloud KMS returned no data key");
  const dataKey = Buffer.from(unwrapped.plaintext as Uint8Array);
  try {
    const plaintext = decryptWithDataKey(encrypted, dataKey, expectedAad);
    const digest = auditContentDigest(plaintext);
    if (digest !== encrypted.contentDigest) throw new Error("Audit content digest mismatch");
    return JSON.parse(plaintext.toString("utf8")) as T;
  } finally {
    dataKey.fill(0);
  }
}
