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
  return apiJson<{ ok: boolean; provider: string; model: string; text: string }>("/api/llm/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
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

/** Like apiJson, but 401/403 resolve to a typed failure instead of throwing —
 *  the MFA gate on admin reads is an expected state the UI must render. */
async function apiJsonGated<T>(
  path: string,
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    let error = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.error === "string") error = body.error;
    } catch {
      /* non-JSON error body — keep the status message */
    }
    return { ok: false, status: res.status, error };
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

export function createCheckout(planId: string) {
  return apiJson<{ ok: boolean; url?: string; error?: string; nextStep?: string }>("/api/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ planId }),
  });
}
