import { ResearchPaper } from "./client";
import { researchMeta, toNextMetadata } from "@/lib/route-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return toNextMetadata(researchMeta(slug), `/research/${slug}`);
}

export default function Page() {
  return <ResearchPaper />;
}
