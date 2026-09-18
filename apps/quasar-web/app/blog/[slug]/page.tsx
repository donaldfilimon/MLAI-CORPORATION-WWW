import { BlogPost } from "./client";
import { blogMeta, toNextMetadata } from "@/lib/route-meta";
import { blogPostingLd } from "@/lib/structured-data";
import { content } from "@/data";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  return content.blog.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return toNextMetadata(blogMeta(slug), `/blog/${slug}`);
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = content.blog.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        // Safe only because the payload is in-repo content validated by the
        // Zod schema in src/data/schemas (see content.test.ts) — JSON.stringify
        // does NOT escape "</script>", so never widen this to user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd(post)) }}
      />
      <BlogPost />
    </>
  );
}
