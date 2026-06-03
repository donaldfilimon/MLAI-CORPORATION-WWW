import { Hono } from "hono";
import type { Context } from "hono";
import { serveStatic } from "hono/bun";
import { WorkOS } from "@workos-inc/node";
import { createCookieSessionStorage, toPublicUser, type SessionData } from "./server/session.ts";
import { rateLimiter, loggerMiddleware, sessionRenewal } from "./server/middleware";
import { Database } from "bun:sqlite";

const app = new Hono();

// Initialize SQLite database using Bun's native sqlite module
const db = new Database("inquiries.db");
db.run(`
  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    project_type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Global Logger
app.use("*", loggerMiddleware);

// Session Renewal for all routes
const SESSION_SECRET = process.env.SESSION_SECRET;
const session = createCookieSessionStorage(SESSION_SECRET ?? "development-only-change-me-32-characters-minimum");
app.use("*", sessionRenewal(session));

const WORKOS_API_KEY = process.env.WORKOS_API_KEY;
const CLIENT_ID = process.env.WORKOS_CLIENT_ID;
const APP_URL = process.env.APP_URL ?? "http://localhost:3001";
const FRONTEND_URL = process.env.FRONTEND_URL ?? APP_URL;
const REDIRECT_URI = `${APP_URL}/api/auth/callback`;

if (!WORKOS_API_KEY || !CLIENT_ID || !SESSION_SECRET) {
  console.warn("WorkOS auth is not fully configured. Set WORKOS_API_KEY, WORKOS_CLIENT_ID, and SESSION_SECRET.");
}

const workos = WORKOS_API_KEY ? new WorkOS(WORKOS_API_KEY) : null;

function getReturnTo(value: string | undefined | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.startsWith("/api/")) return "/";
  return value;
}

function redirectToFrontend(path = "/") {
  return new URL(getReturnTo(path), FRONTEND_URL).toString();
}

function requireWorkOS() {
  if (!workos || !CLIENT_ID) return null;
  return workos;
}

async function getAuthenticatedUser(c: Context): Promise<SessionData | null> {
  return session.get(c);
}

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

async function generateLlmResponse(messages: ChatMessage[], user: SessionData) {
  const provider = process.env.LLM_PROVIDER ?? "gemini";
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";

  if (provider === "gemini" && process.env.GEMINI_API_KEY) {
    const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
    const prompt = messages
      .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
      .join("\n\n");

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are MLAI's private AI systems assistant. Be direct, technical, and safety-conscious. The signed-in user is ${user.email}.\n\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 900,
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Gemini request failed: ${res.status} ${detail}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("").trim();
    if (text) return { provider, model, text };
  }

  return {
    provider: "local-fallback",
    model: "mlai-safe-scaffold",
    text: `LLM provider is not configured yet, so this protected API returned a scaffolded response. Received request: ${lastUserMessage || "No prompt provided."}\n\nNext steps: set GEMINI_API_KEY or another provider key server-side, keep calls behind WorkOS sessions, and add workflow-specific policies before enabling production actions.`,
  };
}

// ── Auth routes ──────────────────────────────────────────────────────────────

const authRateLimit = rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }); // 100 per 15m

// GET /api/auth/login — redirect to WorkOS AuthKit sign-in
app.get("/api/auth/login", authRateLimit, (c) => {
  const auth = requireWorkOS();
  if (!auth || !CLIENT_ID) return c.redirect("/login?error=auth_not_configured");

  const redirectUrl = auth.userManagement.getAuthorizationUrl({
    provider: "authkit",
    redirectUri: REDIRECT_URI,
    clientId: CLIENT_ID,
    state: getReturnTo(c.req.query("returnTo")),
    screenHint: "sign-in",
  });
  return c.redirect(redirectUrl);
});

// GET /api/auth/signup — redirect to WorkOS AuthKit sign-up
app.get("/api/auth/signup", authRateLimit, (c) => {
  const auth = requireWorkOS();
  if (!auth || !CLIENT_ID) return c.redirect("/login?error=auth_not_configured");

  const redirectUrl = auth.userManagement.getAuthorizationUrl({
    provider: "authkit",
    redirectUri: REDIRECT_URI,
    clientId: CLIENT_ID,
    state: getReturnTo(c.req.query("returnTo")),
    screenHint: "sign-up",
  });
  return c.redirect(redirectUrl);
});

// GET /api/auth/callback — exchange code for user session
app.get("/api/auth/callback", async (c) => {
  const auth = requireWorkOS();
  if (!auth || !CLIENT_ID) return c.redirect(redirectToFrontend("/login?error=auth_not_configured"));

  const error = c.req.query("error");
  if (error) return c.redirect(redirectToFrontend(`/login?error=${encodeURIComponent(error)}`));

  const code = c.req.query("code");
  if (!code) return c.redirect(redirectToFrontend("/login?error=missing_code"));

  try {
    const { user, accessToken, refreshToken, organizationId, authenticationMethod } = await auth.userManagement.authenticateWithCode({
      code,
      clientId: CLIENT_ID,
    });

    const cookie = await session.set(c, {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.profilePictureUrl ?? null,
      organizationId: organizationId ?? null,
      authenticationMethod: authenticationMethod ?? null,
      accessToken,
      refreshToken,
    });

    c.header("Set-Cookie", cookie);
    return c.redirect(redirectToFrontend(c.req.query("state")));
  } catch (err) {
    console.error("WorkOS auth error:", err);
    return c.redirect(redirectToFrontend("/login?error=auth_failed"));
  }
});

// GET /api/auth/me — return current session user
app.get("/api/auth/me", async (c) => {
  const user = await session.get(c);
  if (!user) return c.json({ user: null }, 200);
  return c.json({ user: toPublicUser(user) });
});

// POST /api/auth/logout — clear session
app.post("/api/auth/logout", async (c) => {
  const clearedCookie = await session.destroy(c);
  c.header("Set-Cookie", clearedCookie);
  return c.json({ ok: true });
});

app.get("/api/auth/features", (c) => {
  return c.json({
    authkit: Boolean(workos && CLIENT_ID),
    cookies: {
      name: "mlai_session",
      httpOnly: true,
      sameSite: "Lax",
      secureInProduction: true,
      maxAgeDays: 7,
    },
    capabilities: {
      signIn: true,
      signUp: true,
      autoLogin: true,
      mfa: "Configure MFA policies in the WorkOS dashboard for this AuthKit environment.",
      passkeys: "Enable passkeys in the WorkOS dashboard; hosted AuthKit will present them automatically when available.",
    },
  });
});

app.get("/api/auth/verify-user", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const auth = requireWorkOS();
  if (!auth) return c.json({ error: "WorkOS is not configured" }, 503);

  try {
    const workosUser = await auth.userManagement.getUser(user.userId);
    return c.json({
      ok: true,
      user: toPublicUser(user),
      workos: {
        id: workosUser.id,
        email: workosUser.email,
        emailVerified: workosUser.emailVerified,
        firstName: workosUser.firstName,
        lastName: workosUser.lastName,
        profilePictureUrl: workosUser.profilePictureUrl,
        createdAt: workosUser.createdAt,
        updatedAt: workosUser.updatedAt,
      },
    });
  } catch (err) {
    console.error("WorkOS user verification error:", err);
    return c.json({ error: "User could not be verified with WorkOS" }, 502);
  }
});

app.patch("/api/profile", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const auth = requireWorkOS();
  if (!auth) return c.json({ error: "WorkOS is not configured" }, 503);

  let body: { firstName?: string; lastName?: string; company?: string; useCase?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const firstName = typeof body.firstName === "string" ? body.firstName.trim().slice(0, 80) : undefined;
  const lastName = typeof body.lastName === "string" ? body.lastName.trim().slice(0, 80) : undefined;
  const company = typeof body.company === "string" ? body.company.trim().slice(0, 120) : undefined;
  const useCase = typeof body.useCase === "string" ? body.useCase.trim().slice(0, 240) : undefined;

  try {
    const updated = await auth.userManagement.updateUser({
      userId: user.userId,
      firstName,
      lastName,
      metadata: {
        company: company || null,
        use_case: useCase || null,
      },
    });

    const cookie = await session.set(c, {
      ...user,
      firstName: updated.firstName,
      lastName: updated.lastName,
      avatarUrl: updated.profilePictureUrl ?? user.avatarUrl ?? null,
    });
    c.header("Set-Cookie", cookie);

    return c.json({ ok: true, user: toPublicUser({ ...user, firstName: updated.firstName, lastName: updated.lastName }) });
  } catch (err) {
    console.error("WorkOS profile update error:", err);
    return c.json({ error: "Profile update failed" }, 502);
  }
});

// ── Protected app API ────────────────────────────────────────────────────────

app.get("/api/llm/status", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const provider = process.env.LLM_PROVIDER ?? "gemini";
  return c.json({
    ok: true,
    user: toPublicUser(user),
    llm: {
      provider,
      configured: provider === "gemini" ? Boolean(process.env.GEMINI_API_KEY) : false,
      model: process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
    },
  });
});

const chatRateLimit = rateLimiter({ windowMs: 60 * 1000, max: 10 }); // 10 per minute

app.post("/api/llm/chat", chatRateLimit, async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  let body: { messages?: ChatMessage[] };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const messages = body.messages?.filter((message) =>
    ["system", "user", "assistant"].includes(message.role) && typeof message.content === "string" && message.content.trim().length > 0
  ).slice(-12) ?? [];

  if (messages.length === 0) return c.json({ error: "At least one message is required" }, 400);

  try {
    const response = await generateLlmResponse(messages, user);
    return c.json({ ok: true, ...response });
  } catch (err) {
    console.error("LLM API error:", err);
    return c.json({ error: "LLM request failed" }, 502);
  }
});

app.get("/api/billing/plans", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  return c.json({
    ok: true,
    plans: [
      {
        id: "pilot",
        name: "Pilot",
        price: "$2,500/mo",
        description: "Private console access, protected LLM API, readiness audit support, and prototype evaluation gates.",
      },
      {
        id: "platform",
        name: "Platform",
        price: "Custom",
        description: "Team workspaces, private deployment support, custom retrieval pipelines, and production reliability reviews.",
      },
    ],
    provider: process.env.BILLING_PROVIDER ?? "manual",
    checkoutConfigured: Boolean(process.env.STRIPE_PAYMENT_LINK),
  });
});

app.post("/api/billing/checkout", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const paymentLink = process.env.STRIPE_PAYMENT_LINK;
  if (!paymentLink) {
    return c.json({
      ok: false,
      error: "Billing checkout is not configured yet.",
      nextStep: "Set STRIPE_PAYMENT_LINK or replace this endpoint with Stripe Checkout session creation.",
    }, 503);
  }

  const url = new URL(paymentLink);
  url.searchParams.set("prefilled_email", user.email);
  url.searchParams.set("client_reference_id", user.userId);
  return c.json({ ok: true, url: url.toString() });
});

// ── Inquiries API ────────────────────────────────────────────────────────────

const inquiryRateLimit = rateLimiter({ windowMs: 5 * 60 * 1000, max: 5 }); // 5 submissions per 5 minutes

app.post("/api/inquiries", inquiryRateLimit, async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const projectType = typeof body.projectType === "string" ? body.projectType.trim() : "research";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (name.length < 2) {
    return c.json({ error: "Name must be at least 2 characters" }, 400);
  }
  if (!email || !email.includes("@")) {
    return c.json({ error: "Invalid email address" }, 400);
  }
  if (company.length < 2) {
    return c.json({ error: "Company name is required" }, 400);
  }
  if (message.length < 10) {
    return c.json({ error: "Message must be at least 10 characters" }, 400);
  }

  try {
    const query = db.prepare(`
      INSERT INTO inquiries (name, email, company, project_type, message)
      VALUES ($name, $email, $company, $projectType, $message)
    `);
    query.run({
      $name: name,
      $email: email,
      $company: company,
      $projectType: projectType,
      $message: message,
    });
    return c.json({ ok: true, message: "Inquiry submitted successfully." });
  } catch (err) {
    console.error("Database error saving inquiry:", err);
    return c.json({ error: "Failed to store inquiry" }, 500);
  }
});

app.get("/api/inquiries", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const query = db.prepare("SELECT * FROM inquiries ORDER BY created_at DESC");
    const inquiries = query.all();
    return c.json({ ok: true, inquiries });
  } catch (err) {
    console.error("Database error loading inquiries:", err);
    return c.json({ error: "Failed to load inquiries" }, 500);
  }
});

// Serve static assets from the dist folder
app.use("/assets/*", serveStatic({ root: "./dist" }));
app.use("/favicon.ico", serveStatic({ path: "./dist/favicon.ico" }));

// SPA fallback — serve index.html for all other routes
app.get("*", async (c) => {
  const file = Bun.file("./dist/index.html");
  if (await file.exists()) {
    return c.html(await file.text());
  }
  return c.text("Production build not found. Run 'bun run build' first.", 404);
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3001);

console.log(`🚀 MLAI server (Bun-native) running on http://localhost:${PORT}`);

export default {
  port: PORT,
  fetch: app.fetch,
};
