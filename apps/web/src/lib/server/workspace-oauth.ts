/**
 * Per-user OAuth for the console's workspace sources.
 *
 * Each console user connects their own Google and/or Microsoft account; the
 * server exchanges the authorization code, keeps only the refresh token
 * (encrypted — see `workspace-tokens.ts`), and mints short-lived access tokens
 * on demand. No workspace token is ever sent to the browser.
 *
 * Scopes are read-only by construction. Widening them is a deliberate change:
 * `workspace-oauth.test.ts` pins the scope strings so a write scope cannot be
 * added without the diff saying so out loud.
 *
 * CSRF: the flow copies the login gate in `workos.ts` — a single-use nonce in
 * an HttpOnly cookie, echoed inside `state` and compared timing-safely at the
 * callback. An attacker can navigate a victim's browser to our callback with
 * their own harvested `code`; what they cannot do is set this cookie. The
 * cookie additionally binds the provider and the PKCE verifier, so a callback
 * for one provider cannot consume the other's pending flow.
 */
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { APP_URL } from "./workos";

export const WORKSPACE_PROVIDERS = ["google", "microsoft"] as const;
export type WorkspaceProvider = (typeof WORKSPACE_PROVIDERS)[number];

/** Path params are attacker-controlled; never index a config map without this. */
export function isWorkspaceProvider(value: unknown): value is WorkspaceProvider {
  return typeof value === "string" && (WORKSPACE_PROVIDERS as readonly string[]).includes(value);
}

interface ProviderConfig {
  readonly label: string;
  readonly authorizeUrl: string;
  readonly tokenUrl: string;
  /** Read-only by design. Pinned by test. */
  readonly scopes: readonly string[];
  readonly clientIdEnv: string;
  readonly clientSecretEnv: string;
  /** Extra authorize params this provider needs to return a refresh token. */
  readonly extraAuthorizeParams: Readonly<Record<string, string>>;
}

function microsoftTenant(): string {
  return process.env.MICROSOFT_OAUTH_TENANT?.trim() || "common";
}

const PROVIDERS: Record<WorkspaceProvider, ProviderConfig> = {
  google: {
    label: "Google Drive",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/drive.readonly", "openid", "email"],
    clientIdEnv: "GOOGLE_OAUTH_CLIENT_ID",
    clientSecretEnv: "GOOGLE_OAUTH_CLIENT_SECRET",
    // Google returns a refresh token only on the first consent unless both of
    // these are set; without them a reconnect yields an access token we cannot
    // renew, and the connection silently dies an hour later.
    extraAuthorizeParams: { access_type: "offline", prompt: "consent" },
  },
  microsoft: {
    label: "SharePoint / OneDrive",
    authorizeUrl: "",
    tokenUrl: "",
    scopes: ["Files.Read.All", "User.Read", "offline_access"],
    clientIdEnv: "MICROSOFT_OAUTH_CLIENT_ID",
    clientSecretEnv: "MICROSOFT_OAUTH_CLIENT_SECRET",
    extraAuthorizeParams: {},
  },
};

export function providerConfig(provider: WorkspaceProvider): ProviderConfig {
  const base = PROVIDERS[provider];
  if (provider !== "microsoft") return base;
  // Resolved per call: the tenant is environment-dependent and a module-level
  // constant would freeze whatever was set at import time.
  const tenant = encodeURIComponent(microsoftTenant());
  return {
    ...base,
    authorizeUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
    tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
  };
}

export function providerLabel(provider: WorkspaceProvider): string {
  return PROVIDERS[provider].label;
}

export interface ProviderCredentials {
  clientId: string;
  clientSecret: string;
}

/**
 * `null` — not an exception — when a provider has no credentials configured.
 * An unconfigured provider is a state the console renders ("not connected"),
 * not a server error, and it must never be reported as one.
 */
export function providerCredentials(provider: WorkspaceProvider): ProviderCredentials | null {
  const config = PROVIDERS[provider];
  const clientId = process.env[config.clientIdEnv]?.trim();
  const clientSecret = process.env[config.clientSecretEnv]?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function isProviderConfigured(provider: WorkspaceProvider): boolean {
  return providerCredentials(provider) !== null;
}

export function workspaceRedirectUri(provider: WorkspaceProvider): string {
  return `${APP_URL}/api/workspace/callback/${provider}`;
}

/* ── state + PKCE ─────────────────────────────────────────────────────────── */

export const WORKSPACE_STATE_COOKIE = "mlai_workspace_state";
const STATE_MAX_AGE = 600; // seconds — the flow is a redirect round-trip, not a session

function base64url(input: Buffer): string {
  return input.toString("base64url");
}

export function createPkceVerifier(): string {
  return base64url(randomBytes(32));
}

export function pkceChallenge(verifier: string): string {
  return base64url(createHash("sha256").update(verifier, "ascii").digest());
}

export interface PendingFlow {
  nonce: string;
  verifier: string;
  provider: WorkspaceProvider;
}

export function encodePendingFlow(flow: PendingFlow): string {
  return base64url(Buffer.from(JSON.stringify(flow), "utf8"));
}

/** Returns null for anything malformed — a bad cookie is a failed flow, not a 500. */
export function decodePendingFlow(raw: string | null | undefined): PendingFlow | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object") return null;
    const { nonce, verifier, provider } = parsed as Record<string, unknown>;
    if (typeof nonce !== "string" || !nonce) return null;
    if (typeof verifier !== "string" || !verifier) return null;
    if (!isWorkspaceProvider(provider)) return null;
    return { nonce, verifier, provider };
  } catch {
    return null;
  }
}

/** The `state` parameter itself — the nonce plus the provider it belongs to. */
export function encodeWorkspaceState(nonce: string, provider: WorkspaceProvider): string {
  return base64url(Buffer.from(JSON.stringify({ nonce, provider }), "utf8"));
}

export function decodeWorkspaceState(
  raw: string | null | undefined,
): { nonce: string; provider: WorkspaceProvider } | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object") return null;
    const { nonce, provider } = parsed as Record<string, unknown>;
    if (typeof nonce !== "string" || !nonce) return null;
    if (!isWorkspaceProvider(provider)) return null;
    return { nonce, provider };
  } catch {
    return null;
  }
}

export function timingSafeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/* SameSite=Lax, matching the login state cookie: the callback arrives as a
   top-level cross-site GET, which Lax allows and Strict would drop. */
export function workspaceStateCookie(value: string): string {
  return `${WORKSPACE_STATE_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${STATE_MAX_AGE}${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

export function clearWorkspaceStateCookie(): string {
  return `${WORKSPACE_STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

export function readPendingFlow(req: Request): PendingFlow | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  const match = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${WORKSPACE_STATE_COOKIE}=`));
  if (!match) return null;
  return decodePendingFlow(match.slice(WORKSPACE_STATE_COOKIE.length + 1) || null);
}

export function buildAuthorizeUrl(
  provider: WorkspaceProvider,
  credentials: ProviderCredentials,
  state: string,
  challenge: string,
): string {
  const config = providerConfig(provider);
  const url = new URL(config.authorizeUrl);
  url.searchParams.set("client_id", credentials.clientId);
  url.searchParams.set("redirect_uri", workspaceRedirectUri(provider));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scopes.join(" "));
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  for (const [key, value] of Object.entries(config.extraAuthorizeParams)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

/* ── token endpoint ───────────────────────────────────────────────────────── */

export interface TokenResponse {
  accessToken: string;
  /** Absent on refresh for providers that do not rotate. */
  refreshToken: string | null;
  /** Absolute epoch milliseconds. */
  expiresAt: number;
  scope: string | null;
}

/** Treated as expired this long before the real deadline, to cover clock skew. */
const EXPIRY_SKEW_MS = 60_000;

function parseTokenResponse(body: unknown): TokenResponse {
  if (!body || typeof body !== "object") throw new Error("Token endpoint returned a non-object");
  const row = body as Record<string, unknown>;
  const accessToken = typeof row.access_token === "string" ? row.access_token : "";
  if (!accessToken) throw new Error("Token endpoint returned no access token");
  const expiresIn = typeof row.expires_in === "number" && row.expires_in > 0 ? row.expires_in : 3600;
  return {
    accessToken,
    refreshToken: typeof row.refresh_token === "string" && row.refresh_token ? row.refresh_token : null,
    expiresAt: Date.now() + expiresIn * 1000 - EXPIRY_SKEW_MS,
    scope: typeof row.scope === "string" ? row.scope : null,
  };
}

/**
 * Token-endpoint errors are summarised, never echoed: the response body can
 * contain the code or the client secret we just sent, and this string reaches
 * logs. Callers surface a generic failure to the browser.
 */
async function postToken(
  provider: WorkspaceProvider,
  params: URLSearchParams,
  fetchImpl: typeof fetch,
): Promise<TokenResponse> {
  const config = providerConfig(provider);
  const response = await fetchImpl(config.tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body: params.toString(),
  });
  if (!response.ok) {
    throw new Error(`${provider} token endpoint responded ${response.status}`);
  }
  return parseTokenResponse(await response.json());
}

export async function exchangeAuthorizationCode(
  provider: WorkspaceProvider,
  credentials: ProviderCredentials,
  code: string,
  verifier: string,
  fetchImpl: typeof fetch = fetch,
): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: workspaceRedirectUri(provider),
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    code_verifier: verifier,
  });
  return postToken(provider, params, fetchImpl);
}

export async function refreshAccessToken(
  provider: WorkspaceProvider,
  credentials: ProviderCredentials,
  refreshToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
  });
  return postToken(provider, params, fetchImpl);
}
