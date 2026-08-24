export type LlmStatus = {
  ok: boolean;
  user: {
    userId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    organizationId?: string | null;
    authenticationMethod?: string | null;
  };
  llm: {
    provider: string;
    configured: boolean;
    model: string;
    gateway: string;
  };
};

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type Inquiry = {
  id: number;
  name: string;
  email: string;
  company: string;
  project_type: string;
  message: string;
  created_at: string;
};

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function getLlmStatus() {
  return apiJson<LlmStatus>("/api/llm/status");
}

export function sendLlmMessage(messages: ChatMessage[]) {
  return apiJson<{
    ok: boolean;
    provider: string;
    model: string;
    text: string;
    audit: { id: string; createdAt: string; expiresAt: string };
  }>("/api/llm/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
}

export type ChatConsent = {
  policyVersion: string;
  accepted: boolean;
  consentedAt: string | null;
  withdrawnAt: string | null;
};

export function getChatConsent() {
  return apiJson<{ ok: true; consent: ChatConsent }>("/api/consent");
}

export function acceptChatConsent(policyVersion: string) {
  return apiJson<{ ok: true; consent: { policyVersion: string; consentedAt: string } }>(
    "/api/consent",
    { method: "POST", body: JSON.stringify({ accepted: true, policyVersion }) },
  );
}

export function withdrawChatConsent() {
  return apiJson<{ ok: true }>("/api/consent", { method: "DELETE" });
}

export type ConversationAuditSummary = {
  id: string;
  provider: string;
  model: string;
  policyVersion: string;
  createdAt: string;
  expiresAt: string;
  subjectHash?: string;
  organizationId?: string;
};

export type ConversationAudit = ConversationAuditSummary & {
  content: {
    messages: ChatMessage[];
    response: { provider: string; model: string; text: string };
  };
};

export function getConversationAudits() {
  return apiJson<{ ok: true; audits: ConversationAuditSummary[] }>("/api/audits");
}

export function getConversationAudit(id: string, download = false) {
  return apiJson<{ ok: true; audit: ConversationAudit }>(
    `/api/audits/${encodeURIComponent(id)}${download ? "?download=1" : ""}`,
  );
}

export function deleteConversationAudit(id: string) {
  return apiJson<{ ok: true }>(`/api/audits/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function getAdminConversationAudits(reason: string) {
  return apiJson<{ ok: true; audits: ConversationAuditSummary[] }>("/api/admin/audits", {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function getAdminConversationAudit(id: string, reason: string) {
  return apiJson<{ ok: true; audit: ConversationAudit }>(
    `/api/admin/audits/${encodeURIComponent(id)}`,
    { method: "POST", body: JSON.stringify({ reason }) },
  );
}

export function getInquiries() {
  return apiJson<{ ok: boolean; inquiries: Inquiry[] }>("/api/inquiries");
}

export function getAuthFeatures() {
  return apiJson<{
    authkit: boolean;
    cookies: { name: string; httpOnly: boolean; sameSite: string; secureInProduction: boolean; maxAgeDays: number };
    capabilities: { signIn: boolean; signUp: boolean; autoLogin: boolean; mfa: string; passkeys: string };
  }>("/api/auth/features");
}

export function verifyWorkosUser() {
  return apiJson<{
    ok: boolean;
    workos: {
      id: string;
      email: string;
      emailVerified: boolean;
      firstName?: string | null;
      lastName?: string | null;
      profilePictureUrl?: string | null;
      createdAt: string;
      updatedAt: string;
    };
  }>("/api/auth/verify-user");
}

export function updateProfile(payload: { firstName?: string; lastName?: string; company?: string; useCase?: string }) {
  return apiJson<{ ok: boolean }>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export type TelemetrySummary = {
  ok: boolean;
  events: Record<string, number>;
  conversion: { opens: number; successes: number; rate: number | null };
};

export type MfaStatus = {
  ok: boolean;
  configured: boolean;
  adminEnforcement: boolean;
  authenticationMethod?: string | null;
  factors: Array<{ id: string; type: string; createdAt: string }>;
};

/** Like apiJson, but an *expected* non-2xx resolves to a typed failure instead
 *  of throwing — the MFA gate on admin reads (401/403), and the two structured
 *  billing outcomes below, are states the UI has to render, not errors to
 *  swallow in a catch.
 *
 *  Two knobs, both additive so the original callers are unchanged:
 *
 *  - `init` lets a gated call be a POST. Without it this was GET-only, which is
 *    why `createCheckout` could not use it and went through `apiJson` instead.
 *  - `expectStatuses` is what stops "gated" from meaning "every failure is a
 *    business outcome". When supplied, only those statuses — and only when the
 *    body is the handler's own structured JSON — resolve; anything else (a 500,
 *    an HTML 503 from the load balancer) still throws so the caller's catch
 *    fires. Callers that omit it keep the original resolve-on-any-non-ok
 *    behavior, which is what the 401/403 MFA gate below wants.
 *
 *  The failure branch also carries the parsed `body`, because a handler's
 *  structured non-error response can hold more than `error` (billing adds a
 *  `nextStep`) and that copy is exactly what the UI needs to show. */
async function apiJsonGated<T>(
  path: string,
  opts?: { init?: RequestInit; expectStatuses?: readonly number[] },
): Promise<
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; body: Record<string, unknown> | null }
> {
  const res = await fetch(path, {
    ...opts?.init,
    headers: { "Content-Type": "application/json", ...opts?.init?.headers },
  });
  if (!res.ok) {
    let body: Record<string, unknown> | null = null;
    try {
      const parsed: unknown = await res.json();
      if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>;
    } catch {
      /* non-JSON error body — keep the status message */
    }
    // A *structured* response is one the handler wrote on purpose: JSON with a
    // string `error`. The distinction matters because infrastructure emits the
    // same statuses — a Cloud Run cold-start 503 arrives as HTML — and rendering
    // "Request failed: 503" as if it were product copy is the failure mode this
    // whole change exists to remove. So a listed status only counts as an
    // outcome when the handler actually spoke.
    const structured = typeof body?.error === "string";
    const error = structured ? (body!.error as string) : `Request failed: ${res.status}`;
    if (opts?.expectStatuses && !(structured && opts.expectStatuses.includes(res.status))) {
      throw new Error(error);
    }
    return { ok: false, status: res.status, error, body };
  }
  return { ok: true, data: (await res.json()) as T };
}

export function getTelemetrySummary() {
  return apiJsonGated<TelemetrySummary>("/api/telemetry/summary");
}

export function getMfaStatus() {
  return apiJsonGated<MfaStatus>("/api/auth/mfa-status");
}

export function getBillingPlans() {
  return apiJson<{
    ok: boolean;
    provider: string;
    checkoutConfigured: boolean;
    plans: Array<{ id: string; name: string; price: string; description: string }>;
  }>("/api/billing/plans");
}

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string; nextStep?: string };

/**
 * POST /api/billing/checkout answers two *structured, non-error* outcomes at
 * non-2xx statuses: **400** when the plan is priced individually (Platform has
 * no self-serve checkout) and **503** when `STRIPE_PAYMENT_LINK` is unset. Both
 * carry `error` + `nextStep` copy written to be shown to the user.
 *
 * This used to route through `apiJson`, which throws on any `!res.ok` — so both
 * branches of the declared `{ ok, url?, error?, nextStep? }` contract were
 * unreachable and a signed-in user clicking Platform was told the system was
 * broken instead of being pointed at sales. Gate exactly those two statuses:
 * a 500 or a network fault still rejects, so `Profile`'s catch keeps meaning
 * "something actually went wrong".
 */
export async function createCheckout(planId: string): Promise<CheckoutResult> {
  const res = await apiJsonGated<{ ok: boolean; url?: string }>("/api/billing/checkout", {
    init: { method: "POST", body: JSON.stringify({ planId }) },
    expectStatuses: [400, 503],
  });

  if (!res.ok) {
    return {
      ok: false,
      error: res.error,
      ...(typeof res.body?.nextStep === "string" ? { nextStep: res.body.nextStep } : {}),
    };
  }

  // A 200 with no payment link is a broken handler, not a business outcome —
  // throw so it surfaces as a failure rather than as silent copy-less UI.
  if (!res.data.url) throw new Error("Checkout response did not include a payment URL.");
  return { ok: true, url: res.data.url };
}
