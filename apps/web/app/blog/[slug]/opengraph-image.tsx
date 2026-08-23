import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { content } from "@/data";

export const runtime = "nodejs";
export const alt = "MLAI Corporation — Lab Notes";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return content.blog.map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = content.blog.find((p) => p.slug === slug);

  return renderOgImage({
    kicker: post?.tag ?? "LAB NOTES",
    title: post?.title ?? "MLAI Corporation",
    subtitle: post ? `${post.date} · ${post.readTime}` : undefined,
  });
}
