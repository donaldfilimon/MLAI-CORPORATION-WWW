import { readStoredSession, type createAuth } from "@mlai/store";

type Auth = ReturnType<typeof createAuth>["auth"];

export async function renderWorkspace(auth: Auth, token: string | null) {
  const session = await readStoredSession(auth, token);
  if (!session?.user?.email) {
    return { status: 401 as const, body: "Sign in required." };
  }
  return {
    status: 200 as const,
    body: `<main><h1>Workspace</h1><p>${session.user.email}</p></main>`,
  };
}
