import { useParams } from "react-router-dom";
import { content } from "@/data";
import { useUI } from "@/lib/ui-context";
import { ArticleLayout, ArticleNotFound } from "@/components/article";

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { openInquiry } = useUI();

  const index = content.blog.findIndex((p) => p.slug === slug);
  const post = index >= 0 ? content.blog[index] : undefined;
  const next =
    index >= 0 ? content.blog[(index + 1) % content.blog.length] : undefined;

  if (!post) {
    return (
      <ArticleNotFound
        eyebrow="404 — Note not found"
        title="That lab note doesn't exist."
        body="It may have been renamed or retired. Browse the latest notes instead."
        backTo="/blog"
        backLabel="All notes"
      />
    );
  }

  return (
    <ArticleLayout
      backTo="/blog"
      backLabel="Lab Notes"
      headingId="post-heading"
      tag={
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-emerald-400 uppercase">
          {post.tag}
        </span>
      }
      date={post.date}
      readTime={post.readTime}
      title={post.title}
      lede={post.excerpt}
      meta={post.author ? `By ${post.author}` : undefined}
      body={post.body}
      inquiryLabel="Talk to our engineers"
      onInquiry={openInquiry}
      next={
        next && next.slug !== post.slug
          ? { to: `/blog/${next.slug}`, label: "Next note", title: next.title }
          : undefined
      }
    />
  );
}
