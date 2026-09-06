/**
 * Encrypted storage for workspace refresh tokens, and access-token minting.
 *
 * What is persisted: the refresh token, wrapped in the same envelope as
 * conversation audits — a random 32-byte data key encrypts it with
 * AES-256-GCM, and Cloud KMS wraps the data key. The AAD binds each ciphertext
 * to its (user, provider) pair, so a row lifted into another user's record
 * fails to decrypt rather than silently granting access to someone else's
 * Drive.
 *
 * What is not persisted: access tokens. They are short-lived, minted on demand,
 * and cached only in this process's memory. Nothing here is ever returned to
 * the browser — the console calls our routes, and our routes call the provider.
 *
 * Key naming: WORKSPACE_KMS_KEY_NAME if set, else AUDIT_KMS_KEY_NAME. Sharing
 * one KMS key across both domains is safe because the AAD differs; a separate
 * key is still preferable operationally (independent rotation and a smaller
 * blast radius), which is why the dedicated variable is checked first.
 */
import { randomBytes } from "node:crypto";
import { KeyManagementServiceClient } from "@google-cloud/kms";
import { decryptWithDataKey, encryptWithDataKey } from "./audit-crypto";
import { ensureDatabase } from "./db";
import {
  providerCredentials,
  refreshAccessToken,
  type WorkspaceProvider,
} from "./workspace-oauth";

declare global {
  var __quesarWorkspaceKms: KeyManagementServiceClient | undefined;
  var __quesarWorkspaceAccessTokens:
    | Map<string, { token: string; expiresAt: number }>
    | undefined;
}

function kms(): KeyManagementServiceClient {
  globalThis.__quesarWorkspaceKms ??= new KeyManagementServiceClient();
  return globalThis.__quesarWorkspaceKms;
}

function requireKmsKeyName(): string {
  const name =
    process.env.WORKSPACE_KMS_KEY_NAME?.trim() || process.env.AUDIT_KMS_KEY_NAME?.trim();
  if (!name) {
    throw new Error(
      "WORKSPACE_KMS_KEY_NAME (or AUDIT_KMS_KEY_NAME) is required to store workspace connections",
    );
  }
  return name;
}

/** Binds a ciphertext to exactly one user and provider. */
export function workspaceAad(userId: string, provider: WorkspaceProvider): string {
  return `quesar-workspace-token:${provider}:${userId}:v1`;
}

export interface WorkspaceConnectionSummary {
  provider: WorkspaceProvider;
  accountEmail: string | null;
  connectedAt: string;
}

interface ConnectionRow {
  ciphertext: Buffer;
  iv: Buffer;
  auth_tag: Buffer;
  wrapped_key: Buffer;
  kms_key_version: string;
  aad: string;
}

/** Persist (or replace) a user's refresh token for one provider. */
export async function saveWorkspaceConnection(input: {
  userId: string;
  provider: WorkspaceProvider;
  refreshToken: string;
  accountEmail: string | null;
  scope: string | null;
}): Promise<void> {
  const aad = workspaceAad(input.userId, input.provider);
  const dataKey = randomBytes(32);
  try {
    const encrypted = encryptWithDataKey(Buffer.from(input.refreshToken, "utf8"), dataKey, aad);
    const keyName = requireKmsKeyName();
    const [wrapped] = await kms().encrypt({ name: keyName, plaintext: dataKey });
    if (!wrapped.ciphertext) throw new Error("Cloud KMS returned no wrapped data key");

    const sql = await ensureDatabase();
    await sql`
      INSERT INTO workspace_connections (
        user_id, provider, account_email, scope,
        ciphertext, iv, auth_tag, wrapped_key, kms_key_version, aad, updated_at
      ) VALUES (
        ${input.userId}, ${input.provider}, ${input.accountEmail}, ${input.scope},
        ${encrypted.ciphertext}, ${encrypted.iv}, ${encrypted.authTag},
        ${Buffer.from(wrapped.ciphertext as Uint8Array)}, ${wrapped.name ?? keyName}, ${aad}, NOW()
      )
      ON CONFLICT (user_id, provider) DO UPDATE SET
        account_email = EXCLUDED.account_email,
        scope = EXCLUDED.scope,
        ciphertext = EXCLUDED.ciphertext,
        iv = EXCLUDED.iv,
        auth_tag = EXCLUDED.auth_tag,
        wrapped_key = EXCLUDED.wrapped_key,
        kms_key_version = EXCLUDED.kms_key_version,
        aad = EXCLUDED.aad,
        updated_at = NOW()`;
  } finally {
    // Zero the data key whether or not the write succeeded.
    dataKey.fill(0);
  }
  // A replaced token invalidates anything cached for the old one.
  accessTokenCache().delete(cacheKey(input.userId, input.provider));
}

export async function listWorkspaceConnections(
  userId: string,
): Promise<WorkspaceConnectionSummary[]> {
  const sql = await ensureDatabase();
  const rows = await sql<
    { provider: WorkspaceProvider; account_email: string | null; connected_at: Date }[]
  >`
    SELECT provider, account_email, connected_at
    FROM workspace_connections
    WHERE user_id = ${userId}
    ORDER BY provider`;
  return rows.map((row) => ({
    provider: row.provider,
    accountEmail: row.account_email,
    connectedAt: row.connected_at.toISOString(),
  }));
}

export async function deleteWorkspaceConnection(
  userId: string,
  provider: WorkspaceProvider,
): Promise<boolean> {
  const sql = await ensureDatabase();
  const rows = await sql`
    DELETE FROM workspace_connections
    WHERE user_id = ${userId} AND provider = ${provider}
    RETURNING provider`;
  accessTokenCache().delete(cacheKey(userId, provider));
  return rows.length > 0;
}

async function readRefreshToken(
  userId: string,
  provider: WorkspaceProvider,
): Promise<string | null> {
  const sql = await ensureDatabase();
  const rows = await sql<ConnectionRow[]>`
    SELECT ciphertext, iv, auth_tag, wrapped_key, kms_key_version, aad
    FROM workspace_connections
    WHERE user_id = ${userId} AND provider = ${provider}`;
  const row = rows[0];
  if (!row) return null;

  const expectedAad = workspaceAad(userId, provider);
  // A row whose AAD does not match this (user, provider) is not this user's to
  // decrypt. Refuse rather than attempting it.
  if (row.aad !== expectedAad) throw new Error("Workspace token additional data mismatch");

  const [unwrapped] = await kms().decrypt({
    name: row.kms_key_version || requireKmsKeyName(),
    ciphertext: row.wrapped_key,
  });
  if (!unwrapped.plaintext) throw new Error("Cloud KMS returned no data key");
  const dataKey = Buffer.from(unwrapped.plaintext as Uint8Array);
  try {
    const plaintext = decryptWithDataKey(
      { ciphertext: row.ciphertext, iv: row.iv, authTag: row.auth_tag },
      dataKey,
      expectedAad,
    );
    return plaintext.toString("utf8");
  } finally {
    dataKey.fill(0);
  }
}

function accessTokenCache(): Map<string, { token: string; expiresAt: number }> {
  globalThis.__quesarWorkspaceAccessTokens ??= new Map();
  return globalThis.__quesarWorkspaceAccessTokens;
}

function cacheKey(userId: string, provider: WorkspaceProvider): string {
  return `${provider}:${userId}`;
}

/** Distinguishes "this user has not connected" from "the call failed". */
export class WorkspaceNotConnectedError extends Error {
  constructor(public readonly provider: WorkspaceProvider) {
    super(`${provider} is not connected for this user`);
    this.name = "WorkspaceNotConnectedError";
  }
}

/**
 * Mint an access token for one user and provider, refreshing through the
 * stored refresh token when the cached one has expired.
 *
 * Throws `WorkspaceNotConnectedError` when there is no connection or the
 * provider has no credentials configured — both are "not connected" from the
 * console's point of view, and the route renders them as such rather than as
 * an error.
 */
export async function getWorkspaceAccessToken(
  userId: string,
  provider: WorkspaceProvider,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const cached = accessTokenCache().get(cacheKey(userId, provider));
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const credentials = providerCredentials(provider);
  if (!credentials) throw new WorkspaceNotConnectedError(provider);

  const refreshToken = await readRefreshToken(userId, provider);
  if (!refreshToken) throw new WorkspaceNotConnectedError(provider);

  const refreshed = await refreshAccessToken(provider, credentials, refreshToken, fetchImpl);

  // Providers that rotate refresh tokens hand back a new one; persisting it is
  // not optional, because the old one stops working the moment it is used.
  if (refreshed.refreshToken && refreshed.refreshToken !== refreshToken) {
    await saveWorkspaceConnectionRefreshOnly(userId, provider, refreshed.refreshToken);
  }

  accessTokenCache().set(cacheKey(userId, provider), {
    token: refreshed.accessToken,
    expiresAt: refreshed.expiresAt,
  });
  return refreshed.accessToken;
}

/** Rotation path — replaces the ciphertext without touching account metadata. */
async function saveWorkspaceConnectionRefreshOnly(
  userId: string,
  provider: WorkspaceProvider,
  refreshToken: string,
): Promise<void> {
  const aad = workspaceAad(userId, provider);
  const dataKey = randomBytes(32);
  try {
    const encrypted = encryptWithDataKey(Buffer.from(refreshToken, "utf8"), dataKey, aad);
    const keyName = requireKmsKeyName();
    const [wrapped] = await kms().encrypt({ name: keyName, plaintext: dataKey });
    if (!wrapped.ciphertext) throw new Error("Cloud KMS returned no wrapped data key");
    const sql = await ensureDatabase();
    await sql`
      UPDATE workspace_connections SET
        ciphertext = ${encrypted.ciphertext},
        iv = ${encrypted.iv},
        auth_tag = ${encrypted.authTag},
        wrapped_key = ${Buffer.from(wrapped.ciphertext as Uint8Array)},
        kms_key_version = ${wrapped.name ?? keyName},
        aad = ${aad},
        updated_at = NOW()
      WHERE user_id = ${userId} AND provider = ${provider}`;
  } finally {
    dataKey.fill(0);
  }
}
