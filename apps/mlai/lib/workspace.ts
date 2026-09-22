import { readStoredSession, sharedAuth } from "@mlai/store";

export function sessionToken(cookie: string | null) {
  return cookie?.match(/(?:^|;\s*)better-auth\.session_token=([^;]+)/)?.[1] ?? null;
}

/** Resolves the Better Auth session for `/app/*`. One shared pool per database URL. */
export async function loadWorkspaceFromCookie(cookie: string | null) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  const { auth } = sharedAuth(connectionString);
  const session = await readStoredSession(auth, sessionToken(cookie));
  if (!session?.user?.email) return null;
  return { email: session.user.email };
}
