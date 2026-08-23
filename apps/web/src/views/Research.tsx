import { research } from '@/data/categories/research';
import { PageHeader } from "@/components/PageHeader";
import { CardGrid } from "@/components/CardGrid";
import { FeatureCard, PublicationIndex, type Accent } from "@/components/site";

/**
 * Tracks read onto the PRODUCT accent axis (see `site/accent.ts`): WDBX Core →
 * wdbx (cyan), Agent Safety → abbey (the agent/persona layer, emerald),
 * Runtime Performance → abi (the runtime/GPU layer, violet). Positional, so it
 * stays in step with the order the content layer declares them in.
 */
const TRACK_ACCENTS: readonly Accent[] = ["wdbx", "abbey", "abi"];

/**
 * Hoisted to module scope so the mapped array keeps a stable identity across
 * renders — `PublicationIndex` memoizes its tag set on `items`.
 * `date` carries the publication date and the read time together because the
 * index has one metadata slot; both strings come from the content layer verbatim.
 */
const PUBLICATIONS = research.publications.map((item) => ({
  slug: item.slug,
  title: item.title,
  summary: item.abstract,
  date: `${item.date} · ${item.readTime}`,
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
          tag="DYNAMIC RESEARCH ARCHIVE"
          title="Applied research for accountable autonomy."
          subtitle="Architecture notes, safety memos, and engineering studies behind traceable retrieval, controlled agent workflows, and private deployment paths."
        />

        <CardGrid cols={3} className="mb-16">
          {research.tracks.map((track, index) => (
            <FeatureCard
              key={track.name}
              title={track.name}
              desc={track.description}
              accent={TRACK_ACCENTS[index] ?? "wdbx"}
            />
          ))}
        </CardGrid>

        {/* basePath defaults to "/research", so each entry links to
            /research/<slug> — the same URLs the cards linked to. */}
        {/* The filter chips carry the content layer's ALL-CAPS tag strings
            ("CORE ARCHITECTURE", "ETHICS & SAFETY"), so they get the site's
            mono + tracked label treatment rather than untracked proportional
            caps. */}
        <PublicationIndex
          items={PUBLICATIONS}
          className="max-w-5xl [&_button]:font-mono [&_button]:tracking-[0.14em]"
        />
      </div>
    </section>
  );
};
