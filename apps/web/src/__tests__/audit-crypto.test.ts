import { describe, expect, it } from "vitest";
import {
  auditSubjectHash,
  auditAad,
  decryptWithDataKey,
  encryptWithDataKey,
} from "@/lib/server/audit-crypto";

describe("conversation audit cryptography", () => {
  it("round-trips AES-256-GCM content with bound additional data", () => {
    const key = Buffer.alloc(32, 7);
    const plaintext = Buffer.from('{"prompt":"private"}', "utf8");
    const encrypted = encryptWithDataKey(plaintext, key, "audit:one:v1");
    expect(encrypted.ciphertext.equals(plaintext)).toBe(false);
    expect(decryptWithDataKey(encrypted, key, "audit:one:v1")).toEqual(plaintext);
    expect(() => decryptWithDataKey(encrypted, key, "audit:other:v1")).toThrow();
  });

  it("pseudonymizes a subject deterministically without exposing the user id", () => {
    const pepper = "a-production-length-pepper-that-is-over-32-characters";
    const first = auditSubjectHash("user_123", pepper);
    expect(first).toBe(auditSubjectHash("user_123", pepper));
    expect(first).not.toContain("user_123");
    expect(first).toHaveLength(64);
    expect(auditSubjectHash("user_456", pepper)).not.toBe(first);
  });

  it("rejects missing or weak pseudonymization secrets", () => {
    expect(() => auditSubjectHash("user_123", "short")).toThrow(/32/);
  });

  it("derives additional data from the immutable audit identifier", () => {
    expect(auditAad("audit-one")).toBe("quesar-conversation-audit:audit-one:v1");
    expect(auditAad("audit-two")).not.toBe(auditAad("audit-one"));
  });
});
