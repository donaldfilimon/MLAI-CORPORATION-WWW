import { blog } from '@/data/categories/blog';
import { PageHeader } from "@/components/PageHeader";
import { CardGrid } from "@/components/CardGrid";
import { FeatureCard, PublicationIndex } from "@/components/site";

/**
 * The three standing rubrics above the index. They are editorial lanes, not
 * products, so they all keep the default (cyan) accent rather than being
 * mapped onto the product accent axis.
 */
const RUBRICS = ["Architecture memos", "Safety drills", "Operator UX"] as const;
const RUBRIC_DESC =
  "Practical context, patterns, and decision notes for production-minded AI teams.";

/**
 * Hoisted to module scope so the mapped array keeps a stable identity across
 * renders — `PublicationIndex` memoizes its tag set on `items`.
 * `date` carries the post date and the read time together because the index has
 * one metadata slot; both strings come from the content layer verbatim.
 */
const POSTS = blog.map((post) => ({
  slug: post.slug,
  title: post.title,
  summary: post.excerpt,
  date: `${post.date} · ${post.readTime}`,
  tags: [post.tag],
}));

export function Blog() {
  return (
    <section
      className="container-custom pt-32 pb-20 min-h-screen font-sans overflow-hidden"
      aria-labelledby="blog-heading"
    >
      <div className="mx-auto max-w-5xl">
        <PageHeader
          id="blog-heading"
          tag="LAB NOTES"
          title="Research notes for teams building serious AI systems."
          subtitle="Fresh thinking on retrieval, autonomy, interface design, evaluation, and the discipline required to move from experiments to reliable operations."
        />

        <CardGrid cols={3} className="mb-12">
          {RUBRICS.map((item) => (
            <FeatureCard key={item} title={item} desc={RUBRIC_DESC} />
          ))}
        </CardGrid>

        {/* Each entry links to /blog/<slug> — the same URLs the cards linked to. */}
        {/* Mono + tracking on the filter chips for the same reason as
            /research: the tags are ALL-CAPS content-layer strings. */}
        <PublicationIndex
          items={POSTS}
          basePath="/blog"
          className="[&_button]:font-mono [&_button]:tracking-[0.14em]"
        />
      </div>
    </section>
  );
}
