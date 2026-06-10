import { BlogPost } from "./client";
import { blogMeta, toNextMetadata } from "@/lib/route-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return toNextMetadata(blogMeta(slug), `/blog/${slug}`);
}

export default function Page() {
  return <BlogPost />;
}
