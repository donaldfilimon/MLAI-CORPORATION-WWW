import { betterAuth } from "better-auth";
import { Pool } from "pg";

const secret = "mlai-dev-secret-must-be-32-characters-long";

export function createAuth(connectionString: string) {
  const pool = new Pool({ connectionString });
  const auth = betterAuth({
    appName: "MLAI",
    baseURL: "http://127.0.0.1:3478",
    secret,
    database: pool,
    emailAndPassword: { enabled: true, minPasswordLength: 12 },
  });
  return { auth, pool };
}

export async function migrateAuth(connectionString: string) {
  const created = createAuth(connectionString);
  const context = await created.auth.$context;
  await context.runMigrations();
  return created;
}

export async function createStoredSession(
  connectionString: string,
  email: string,
  password: string,
) {
  const { auth, pool } = await migrateAuth(connectionString);
  await auth.api.signUpEmail({
    body: { email, password, name: "Member" },
  });
  const response = await auth.api.signInEmail({
    body: { email, password },
    asResponse: true,
  });
  const setCookie = response.headers.getSetCookie();
  const pair = setCookie.find((cookie) => cookie.startsWith("better-auth.session_token="));
  const token = pair?.split(";")[0]?.slice("better-auth.session_token=".length);
  if (!token) throw new Error("Better Auth did not return a session token");
  const session = await auth.api.getSession({
    headers: new Headers({
      cookie: `better-auth.session_token=${token}`,
    }),
  });
  if (!session?.user?.email) throw new Error("Stored session could not be read");
  return { auth, pool, token, session };
}

export async function readStoredSession(
  auth: ReturnType<typeof createAuth>["auth"],
  token: string | null,
) {
  if (!token) return null;
  return auth.api.getSession({
    headers: new Headers({
      cookie: `better-auth.session_token=${token}`,
    }),
  });
}
