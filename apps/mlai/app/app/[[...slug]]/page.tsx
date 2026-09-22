import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { ConsoleWorkspace } from "../../console/workspace/client";
import { loadWorkspaceFromCookie } from "../../../lib/workspace";

export const dynamic = "force-dynamic";

export function SignedConsole({ email }: { email: string }) {
  return (
    <main>
      <ConsoleWorkspace />
      <p>{email}</p>
    </main>
  );
}

export default async function Page() {
  const cookie = (await headers()).get("cookie");
  const session = await loadWorkspaceFromCookie(cookie);
  if (!session) unauthorized();
  return <SignedConsole email={session.email} />;
}
