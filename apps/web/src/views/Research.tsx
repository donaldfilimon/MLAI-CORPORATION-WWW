import { research } from '@/data/categories/research';
import { PageHeader } from "@/components/PageHeader";
import { ResearchAreaGrid } from "@/components/research";
import { PublicationIndex } from "@/components/site";

const PUBLICATIONS = research.publications.map((item) => ({
  slug: item.slug,
  title: item.title,
  summary: item.practicalSummary,
  date: `${item.documentType.replaceAll("-", " ")} · ${item.status} · ${item.date} · ${item.readTime}`,
  tags: [item.tag],
}));

export const Research = () => {
  return (
    <section
      id="research"
      className="min-h-screen section-y bg-bg relative overflow-hidden font-sans"
      aria-labelledby="research-heading"
    >
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-cyan-900/10 to-transparent -z-10" />
      <div className="container-custom">
        <PageHeader
          id="research-heading"
          tag="MLAI RESEARCH"
          title="Understand the systems behind intelligent assistance."
          subtitle="Explore six research areas, from AI assistance and durable memory to evidence selection and integration. Start with practical applications, then inspect the sources, implementation status, and limitations."
        />

        <ResearchAreaGrid tracks={research.tracks} />
        <h2 className="text-3xl font-display text-white mb-6">Research collection</h2>

        {/* basePath defaults to "/research", so each entry links to
            /research/<slug> — the same URLs the cards linked to. */}
        {/* The filter chips carry the content layer's ALL-CAPS tag strings
            ("CORE ARCHITECTURE", "ETHICS & SAFETY"), so they get the site's
            mono + tracked label treatment rather than untracked proportional
            caps. */}
        <PublicationIndex
          items={PUBLICATIONS}
          className="max-w-5xl [&_button]:text-sm [&_a>span:first-child>span:first-child]:text-lg [&_a>span:first-child>span:last-child]:text-sm [&_a>span:last-child]:text-base"
        />
      </div>
    </section>
  );
};
