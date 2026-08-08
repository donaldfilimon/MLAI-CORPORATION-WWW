import { BlogPost } from "./client";
import { blogMeta, toNextMetadata } from "@/lib/route-meta";
import { blogPostingLd } from "@/lib/structured-data";
import { content } from "@/data";

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
  return (
    <>
      {post ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd(post)) }}
        />
      ) : null}
      <BlogPost />
    </>
  );
}
