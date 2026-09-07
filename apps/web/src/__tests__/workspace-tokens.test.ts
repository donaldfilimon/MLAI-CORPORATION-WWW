/**
 * The token store's security property is the AAD binding: a stored refresh
 * token is cryptographically tied to one (user, provider) pair, so a row
 * copied into someone else's record fails to decrypt instead of handing them
 * another person's Drive.
 *
 * The DB and KMS paths need real infrastructure and are exercised in
 * deployment; what is unit-testable — and what actually carries the
 * guarantee — is the binding itself against the shared envelope primitives.
 */
import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { decryptWithDataKey, encryptWithDataKey } from "../lib/server/audit-crypto";
import { workspaceAad } from "../lib/server/workspace-tokens";

describe("workspaceAad", () => {
  it("is distinct per user, per provider, and per domain", () => {
    expect(workspaceAad("user-1", "google")).toBe("quesar-workspace-token:google:user-1:v1");
    expect(workspaceAad("user-1", "google")).not.toBe(workspaceAad("user-2", "google"));
    expect(workspaceAad("user-1", "google")).not.toBe(workspaceAad("user-1", "microsoft"));
    // Distinct from the conversation-audit domain, which is what makes sharing
    // one KMS key between the two safe.
    expect(workspaceAad("user-1", "google")).not.toContain("conversation-audit");
  });
});

describe("refresh-token envelope", () => {
  const dataKey = randomBytes(32);

  it("round-trips under the matching AAD", () => {
    const aad = workspaceAad("user-1", "google");
    const sealed = encryptWithDataKey(Buffer.from("refresh-token-1", "utf8"), dataKey, aad);
    expect(sealed.ciphertext.toString("utf8")).not.toContain("refresh-token-1");
    expect(decryptWithDataKey(sealed, dataKey, aad).toString("utf8")).toBe("refresh-token-1");
  });

  it("refuses to open one user's token under another user's AAD", () => {
    const sealed = encryptWithDataKey(
      Buffer.from("refresh-token-1", "utf8"),
      dataKey,
      workspaceAad("user-1", "google"),
    );
    // This is the attack the binding exists for: a row lifted from user-1 into
    // user-2's record must not decrypt.
    expect(() =>
      decryptWithDataKey(sealed, dataKey, workspaceAad("user-2", "google")),
    ).toThrow();
    // Same user, wrong provider, is equally refused.
    expect(() =>
      decryptWithDataKey(sealed, dataKey, workspaceAad("user-1", "microsoft")),
    ).toThrow();
  });
});
