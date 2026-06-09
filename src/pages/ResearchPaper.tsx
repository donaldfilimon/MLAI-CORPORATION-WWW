import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button, Separator } from "@/components/ui";
import { content } from "@/data";
import { useUI } from "@/lib/ui-context";

const tagColors: Record<string, string> = {
  "CORE ARCHITECTURE": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "ETHICS & SAFETY": "text-teal-400 bg-teal-500/10 border-teal-500/20",
  SCALABILITY: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  ENGINEERING: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  RESEARCH: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  SAFETY: "text-rose-400 bg-rose-500/10 border-rose-400/20",
};

export function ResearchPaper() {
  const { slug } = useParams<{ slug: string }>();
  const { openInquiry } = useUI();

  const papers = content.research.publications;
  const index = papers.findIndex((p) => p.slug === slug);
  const paper = index >= 0 ? papers[index] : undefined;
  const next = index >= 0 ? papers[(index + 1) % papers.length] : undefined;

  if (!paper) {
    return (
      <div className="container-custom pt-32 pb-20 min-h-screen font-sans" role="main">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-emerald-400 uppercase">
            404 — Paper not found
          </span>
          <h1 className="mt-4 text-3xl font-display font-bold text-white">
            That research note doesn&apos;t exist.
          </h1>
          <p className="mt-4 text-text-dim">
            It may have been renamed or retired. Browse the research archive
            instead.
          </p>
          <Link
            to="/research"
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Research archive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article
      className="container-custom pt-32 pb-24 min-h-screen font-sans overflow-hidden"
      role="main"
      aria-labelledby="paper-heading"
    >
      <div className="mx-auto max-w-3xl">
        <Link
          to="/research"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-dim hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" /> Research Archive
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <span
              className={`text-[10px] font-mono font-bold tracking-[0.2em] px-2 py-0.5 rounded-sm uppercase border ${
                tagColors[paper.tag] || "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              }`}
            >
              {paper.tag}
            </span>
            <Separator orientation="vertical" className="h-3 bg-white/20" />
            <span className="text-[10px] font-mono text-text-dim/60 uppercase tracking-widest">
              {paper.date}
            </span>
            <Separator orientation="vertical" className="h-3 bg-white/20" />
            <span className="text-[10px] font-mono text-text-dim/60 uppercase tracking-widest">
              {paper.readTime}
            </span>
          </div>
          <h1
            id="paper-heading"
            className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-[1.1] mb-6"
          >
            {paper.title}
          </h1>
          <p className="text-lg md:text-xl text-text-dim leading-relaxed">
            {paper.abstract}
          </p>
          {paper.authors && (
            <p className="mt-6 text-xs font-mono uppercase tracking-widest text-text-dim/50">
              {paper.authors}
            </p>
          )}
        </motion.header>

        <div className="space-y-12">
          {paper.body.map((section, i) => (
            <motion.section
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
                  <p key={p} className="text-base md:text-lg text-text-dim leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
              {section.list && (
                <ul className="mt-6 space-y-3">
                  {section.list.map((item, l) => (
                    <li key={l} className="flex gap-3 text-base text-text-dim leading-relaxed">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>
          ))}
        </div>

        <Separator className="my-14 bg-white/10" />

        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-text-dim/50 mb-2">
              Work with our research team
            </p>
            <Button
              type="button"
              onClick={openInquiry}
              className="font-bold uppercase tracking-widest text-xs"
            >
              Start an inquiry
            </Button>
          </div>

          {next && next.slug !== paper.slug && (
            <Link to={`/research/${next.slug}`} className="group max-w-sm text-right">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-dim/50">
                Next paper
              </span>
              <span className="mt-2 flex items-center justify-end gap-2 text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
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
