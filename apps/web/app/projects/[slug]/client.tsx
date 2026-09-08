"use client";

import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { projects } from "@/data/categories/projects";
import { ArticleNotFound } from "@/components/article";
import { Callout } from "@/components/site";
import { PROJECT_GLYPH_ICON } from "@/lib/project-glyphs";

export function ProjectPage({ slug }: { slug: string }) {
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <ArticleNotFound
        eyebrow="404 — Project not found"
        title="That project doesn't exist."
        body="It may have been renamed or retired. Browse the projects directory instead."
        backTo="/projects"
        backLabel="All projects"
      />
    );
  }

  const Icon = PROJECT_GLYPH_ICON[project.glyph];

  return (
    <article
      className="container-custom pt-32 pb-24 min-h-screen font-sans overflow-hidden"
      role="main"
      aria-labelledby="project-heading"
    >
      <div className="mx-auto max-w-3xl">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-text-dim hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" /> All projects
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-cyan-300" aria-hidden="true" />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase">
              {project.kind}
            </span>
          </div>
          <h1
            id="project-heading"
            className="mt-4 text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-[1.1] mb-6"
          >
            {project.name}
          </h1>
          <p className="text-lg md:text-xl text-text-dim leading-relaxed">{project.tagline}</p>
        </header>

        <div className="space-y-12">
          <section>
            <p className="text-base md:text-lg text-text-dim leading-relaxed">
              {project.description}
            </p>
          </section>

          {project.scope.length > 0 && (
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-5 leading-tight">
                Scope
              </h2>
              <ul className="space-y-3">
                {project.scope.map((item, i) => (
                  <li key={i} className="flex gap-3 text-base text-text-dim leading-relaxed">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Callout label="Limitation">{project.limit}</Callout>

          <section className="flex flex-wrap gap-4">
            <a
              href={project.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white hover:text-cyan-400 transition-colors"
            >
              {project.source.title} <ExternalLink className="w-3 h-3" />
            </a>
            <Link
              to={project.docsHref}
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white hover:text-cyan-400 transition-colors"
            >
              Documentation <ArrowRight className="w-3 h-3" />
            </Link>
          </section>
        </div>
      </div>
    </article>
  );
}
