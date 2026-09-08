"use client";

import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { projects } from "@/data/categories/projects";
import { PageHeader } from "@/components/PageHeader";
import { CardGrid } from "@/components/CardGrid";
import { CardPanel } from "@/components/site";
import { PROJECT_GLYPH_ICON } from "@/lib/project-glyphs";

export function Projects() {
  return (
    <section
      className="container-custom pt-32 pb-20 min-h-screen font-sans overflow-hidden"
      aria-labelledby="projects-heading"
    >
      <div className="mx-auto max-w-5xl">
        <PageHeader
          id="projects-heading"
          tag="PROJECTS"
          title="The projects behind MLAI."
          subtitle="A runtime, a storage layer, a companion identity, and an application framework — introduced with their documented scope and stated limitations, not performance claims."
        />

        <CardGrid cols={2}>
          {projects.map((project) => {
            const Icon = PROJECT_GLYPH_ICON[project.glyph];
            return (
              <Link key={project.slug} to={`/projects/${project.slug}`} className="group">
                <CardPanel gap="sm" className="h-full transition-colors group-hover:border-cyan-400/25">
                  <Icon className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-text-dim/60 uppercase">
                      {project.kind}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-semibold text-white">
                      {project.name}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-text-dim text-pretty">
                    {project.tagline}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                    Read more
                    <ArrowRight className="w-3 h-3 shrink-0 group-hover:translate-x-1 transition-transform" />
                  </span>
                </CardPanel>
              </Link>
            );
          })}
        </CardGrid>
      </div>
    </section>
  );
}
