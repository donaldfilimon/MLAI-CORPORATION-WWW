import type { ReactNode } from "react";
import { m } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BlockMath } from "@/components/Math";

export type ArticleSection = {
  heading?: string;
  paragraphs: string[];
  list?: string[];
  math?: string[];
};

/** Renders a structured article body (heading + paragraphs + bullet list).
 *  Shared by BlogPost, ResearchPaper, and the founder profile. */
export function ArticleSections({ body }: { body: ArticleSection[] }) {
  return (
    <div className="space-y-12">
      {body.map((section, i) => (
        <m.section
          key={section.heading ?? `section-${i}`}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
        >
          {section.heading && (
            <h2 className="text-2xl font-display font-bold text-white mb-5 leading-tight">
              {section.heading}
            </h2>
          )}
          <div className="space-y-5">
            {section.paragraphs.map((para, p) => (
              <p
                key={p}
                className="text-base md:text-lg text-text-dim leading-relaxed"
              >
                {para}
              </p>
            ))}
          </div>
          {section.math && section.math.length > 0 && (
            <div className="mt-6 space-y-3">
              {section.math.map((tex, m) => (
                <BlockMath key={m} tex={tex} />
              ))}
            </div>
          )}
          {section.list && (
            <ul className="mt-6 space-y-3">
              {section.list.map((item, l) => (
                <li
                  key={l}
                  className="flex gap-3 text-base text-text-dim leading-relaxed"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </m.section>
      ))}
    </div>
  );
}

/** Branded in-page 404 block for a missing article/profile. */
export function ArticleNotFound({
  eyebrow,
  title,
  body,
  backTo,
  backLabel,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  backTo: string;
  backLabel: string;
}) {
  return (
    <div className="container-custom pt-32 pb-20 min-h-screen font-sans" role="main">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-indigo-400 uppercase">
          {eyebrow}
        </span>
        <h1 className="mt-4 text-3xl font-display font-bold text-white">{title}</h1>
        {body && <p className="mt-4 text-text-dim">{body}</p>}
        <Link
          to={backTo}
          className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> {backLabel}
        </Link>
      </div>
    </div>
  );
}

type ArticleLayoutProps = {
  backTo: string;
  backLabel: string;
  tag: ReactNode;
  date: string;
  readTime: string;
  headingId: string;
  title: string;
  lede: string;
  meta?: ReactNode;
  body: ArticleSection[];
  inquiryLabel: string;
  onInquiry: () => void;
  next?: { to: string; label: string; title: string };
};

/** Full reading shell for long-form detail pages (blog posts, research papers):
 *  back link → header (tag/date/readtime, title, lede, meta) → body → CTA + next. */
export function ArticleLayout({
  backTo,
  backLabel,
  tag,
  date,
  readTime,
  headingId,
  title,
  lede,
  meta,
  body,
  inquiryLabel,
  onInquiry,
  next,
}: ArticleLayoutProps) {
  return (
    <article
      className="container-custom pt-32 pb-24 min-h-screen font-sans overflow-hidden"
      role="main"
      aria-labelledby={headingId}
    >
      <div className="mx-auto max-w-3xl">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-dim hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" /> {backLabel}
        </Link>

        <m.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            {tag}
            <Separator orientation="vertical" className="h-3 bg-white/20" />
            <span className="text-[10px] font-mono text-text-dim/60 uppercase tracking-widest">
              {date}
            </span>
            <Separator orientation="vertical" className="h-3 bg-white/20" />
            <span className="text-[10px] font-mono text-text-dim/60 uppercase tracking-widest">
              {readTime}
            </span>
          </div>
          <h1
            id={headingId}
            className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-[1.1] mb-6"
          >
            {title}
          </h1>
          <p className="text-lg md:text-xl text-text-dim leading-relaxed">{lede}</p>
          {meta && (
            <p className="mt-6 text-xs font-mono uppercase tracking-widest text-text-dim/50">
              {meta}
            </p>
          )}
        </m.header>

        <ArticleSections body={body} />

        <Separator className="my-14 bg-white/10" />

        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-text-dim/50 mb-2">
              {inquiryLabel}
            </p>
            <Button
              type="button"
              onClick={onInquiry}
              className="font-bold uppercase tracking-widest text-xs"
            >
              Start an inquiry
            </Button>
          </div>

          {next && (
            <Link to={next.to} className="group max-w-sm text-right">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-dim/50">
                {next.label}
              </span>
              <span className="mt-2 flex items-center justify-end gap-2 text-sm font-bold text-white group-hover:text-indigo-400 transition-colors leading-snug">
                {next.title}
                <ArrowRight className="w-3 h-3 shrink-0 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
