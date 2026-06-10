import { useParams } from "react-router-dom";
import { research } from '@/data/categories/research';
import { useUI } from "@/lib/ui-context";
import { ArticleLayout, ArticleNotFound } from "@/components/article";
import { tagColor } from "@/lib/tag-colors";

export function ResearchPaper() {
  const { slug } = useParams<{ slug: string }>();
  const { openInquiry } = useUI();

  const papers = research.publications;
  const index = papers.findIndex((p) => p.slug === slug);
  const paper = index >= 0 ? papers[index] : undefined;
  const next = index >= 0 ? papers[(index + 1) % papers.length] : undefined;

  if (!paper) {
    return (
      <ArticleNotFound
        eyebrow="404 — Paper not found"
        title="That research note doesn't exist."
        body="It may have been renamed or retired. Browse the research archive instead."
        backTo="/research"
        backLabel="Research archive"
      />
    );
  }

  return (
    <ArticleLayout
      backTo="/research"
      backLabel="Research Archive"
      headingId="paper-heading"
      tag={
        <span
          className={`text-[10px] font-mono font-bold tracking-[0.2em] px-2 py-0.5 rounded-sm uppercase border ${tagColor(paper.tag)}`}
        >
          {paper.tag}
        </span>
      }
      date={paper.date}
      readTime={paper.readTime}
      title={paper.title}
      lede={paper.abstract}
      meta={paper.authors}
      body={paper.body}
      inquiryLabel="Work with our research team"
      onInquiry={openInquiry}
      next={
        next && next.slug !== paper.slug
          ? { to: `/research/${next.slug}`, label: "Next paper", title: next.title }
          : undefined
      }
    />
  );
}
