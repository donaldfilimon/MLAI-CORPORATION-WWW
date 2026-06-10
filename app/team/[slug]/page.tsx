import { FounderProfile } from "./client";
import { teamMeta, toNextMetadata } from "@/lib/route-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return toNextMetadata(teamMeta(slug), `/team/${slug}`);
}

export default function Page() {
  return <FounderProfile />;
}
