"use client";

import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { docs } from "@/data/categories/docs";
import type { DocSection } from "@/data/schemas";
import { ArticleNotFound } from "@/components/article";
import { BlockMath } from "@/components/Math";
import { Callout } from "@/components/site";
import { Separator } from "@/components/ui/separator";

/**
 * ASCII-only, hyphen-joined slug of the given text — the anchor base before
 * disambiguation. Curly quotes and other punctuation in vendored headings
 * (e.g. "Use the project's validation gate") collapse into surrounding
 * hyphens rather than surviving into the anchor.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Derive one heading anchor per body section.
 *
 * Task 1 dropped the vendored `id` field, and the vendored data's own
 * id/title pairing was already inconsistent (one section carried
 * `run-the-project-gate` against a title no slugify of the title
 * reproduces), so reproducing the original fragments is neither possible
 * nor useful — none of them were ever published under this domain. The only
 * real requirements are that an anchor is unique within the page and stable
 * across builds. A heading-less section falls back to its own index, and
 * any base that collides with an earlier section in the same doc is
 * disambiguated by appending that section's index — deterministic, not
 * random, and collision-free because indices are themselves unique.
 */
function sectionAnchors(body: readonly DocSection[]): string[] {
  const seen = new Map<string, number>();
  return body.map((section, i) => {
    const base = section.heading ? slugify(section.heading) : `section-${i}`;
    const seenCount = seen.get(base) ?? 0;
    seen.set(base, seenCount + 1);
    return seenCount === 0 ? base : `${base}-${i}`;
  });
}

export function DocPage({ slug }: { slug: string }) {
  const doc = docs.find((d) => d.slug === slug);

  if (!doc) {
    return (
      <ArticleNotFound
        eyebrow="404 — Document not found"
        title="That document doesn't exist."
        body="It may have been renamed or retired. Browse the documentation instead."
        backTo="/docs"
        backLabel="All documentation"
      />
    );
  }

  const anchors = sectionAnchors(doc.body);

  return (
    <article
      className="container-custom pt-32 pb-24 min-h-screen font-sans overflow-hidden"
      role="main"
      aria-labelledby="doc-heading"
    >
      <div className="mx-auto max-w-3xl">
        <Link
          to="/docs"
          className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-text-dim hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" /> All documentation
        </Link>

        <header className="mb-12">
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase">
            {doc.group}
          </span>
          <h1
            id="doc-heading"
            className="mt-4 text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-[1.1] mb-6"
          >
            {doc.title}
          </h1>
          <p className="text-lg md:text-xl text-text-dim leading-relaxed">{doc.description}</p>
        </header>

        <div className="space-y-12">
          {doc.body.map((section, i) => (
            <section key={anchors[i]} id={anchors[i]} className="scroll-mt-32">
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
              {section.math && section.math.length > 0 && (
                <div className="mt-6 space-y-3">
                  {section.math.map((tex, m) => (
                    <BlockMath key={m} tex={tex} />
                  ))}
                </div>
              )}
              {section.code && section.code.length > 0 && (
                <div className="mt-6 space-y-4">
                  {section.code.map((block, c) => (
                    <figure
                      key={c}
                      className="overflow-hidden rounded-lg border border-white/5 bg-white/2"
                    >
                      {block.file && (
                        <figcaption className="border-b border-white/5 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-text-dim/60">
                          {block.file}
                        </figcaption>
                      )}
                      <pre className="overflow-x-auto px-4 py-3.5 text-[13px] leading-relaxed text-cyan-50/85">
                        <code>{block.code}</code>
                      </pre>
                    </figure>
                  ))}
                </div>
              )}
              {section.list && section.list.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {section.list.map((item, l) => (
                    <li key={l} className="flex gap-3 text-base text-text-dim leading-relaxed">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.note && (
                <Callout label="Note" className="mt-6">
                  {section.note}
                </Callout>
              )}
            </section>
          ))}
        </div>

        {doc.sources.length > 0 && (
          <>
            <Separator className="my-14 bg-white/10" />
            <div>
              {/* `sources` is an array of bare provenance keys (e.g. "abi",
                  "gama"), not link objects — render as plain labels rather
                  than inventing hyperlink titles or URLs for them. */}
              <p className="mb-3 text-sm font-mono uppercase tracking-widest text-text-dim/50">
                Sources
              </p>
              <ul className="flex flex-wrap gap-2">
                {doc.sources.map((source) => (
                  <li
                    key={source}
                    className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-text-dim"
                  >
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
