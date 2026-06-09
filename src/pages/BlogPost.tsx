import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button, Separator } from "@/components/ui";
import { content } from "@/data";
import { useUI } from "@/lib/ui-context";

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { openInquiry } = useUI();

  const index = content.blog.findIndex((p) => p.slug === slug);
  const post = index >= 0 ? content.blog[index] : undefined;
  const next =
    index >= 0 ? content.blog[(index + 1) % content.blog.length] : undefined;

  if (!post) {
    return (
      <div
        className="container-custom pt-32 pb-20 min-h-screen font-sans"
        role="main"
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-emerald-400 uppercase">
            404 — Note not found
          </span>
          <h1 className="mt-4 text-3xl font-display font-bold text-white">
            That lab note doesn&apos;t exist.
          </h1>
          <p className="mt-4 text-text-dim">
            It may have been renamed or retired. Browse the latest notes
            instead.
          </p>
          <Link
            to="/blog"
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> All notes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article
      className="container-custom pt-32 pb-24 min-h-screen font-sans overflow-hidden"
      role="main"
      aria-labelledby="post-heading"
    >
      <div className="mx-auto max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-dim hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" /> Lab Notes
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-emerald-400 uppercase">
              {post.tag}
            </span>
            <Separator orientation="vertical" className="h-3 bg-white/20" />
            <span className="text-[10px] font-mono text-text-dim/60 uppercase tracking-widest">
              {post.date}
            </span>
            <Separator orientation="vertical" className="h-3 bg-white/20" />
            <span className="text-[10px] font-mono text-text-dim/60 uppercase tracking-widest">
              {post.readTime}
            </span>
          </div>
          <h1
            id="post-heading"
            className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-[1.1] mb-6"
          >
            {post.title}
          </h1>
          <p className="text-lg md:text-xl text-text-dim leading-relaxed">
            {post.excerpt}
          </p>
          {post.author && (
            <p className="mt-6 text-xs font-mono uppercase tracking-widest text-text-dim/50">
              By {post.author}
            </p>
          )}
        </motion.header>

        <div className="space-y-12">
          {post.body.map((section, i) => (
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
                  <p
                    key={p}
                    className="text-base md:text-lg text-text-dim leading-relaxed"
                  >
                    {para}
                  </p>
                ))}
              </div>
              {section.list && (
                <ul className="mt-6 space-y-3">
                  {section.list.map((item, l) => (
                    <li
                      key={l}
                      className="flex gap-3 text-base text-text-dim leading-relaxed"
                    >
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
              Talk to our engineers
            </p>
            <Button
              type="button"
              onClick={openInquiry}
              className="font-bold uppercase tracking-widest text-xs"
            >
              Start an inquiry
            </Button>
          </div>

          {next && next.slug !== post.slug && (
            <Link
              to={`/blog/${next.slug}`}
              className="group max-w-sm text-right"
            >
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-dim/50">
                Next note
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
