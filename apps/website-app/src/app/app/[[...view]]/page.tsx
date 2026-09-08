import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/server/auth";
import { WorkspaceApp } from "@/components/workspace-app";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Workspace",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ view?: string[] }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const view = (await params).view?.[0] || "";
  if (!session)
    redirect(`/sign-in?returnTo=${encodeURIComponent(`/app/${view}`)}`);
  return <WorkspaceApp view={view} />;
}
