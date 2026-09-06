import type { ReactNode } from "react";
import type { Research } from "../../data/schemas";
import { BlockMath } from "../Math";

type Publication = Research["publications"][number];

const linkStyle = "text-cyan-300 underline underline-offset-4 hover:text-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400";

/** Plain anchors and visible server markup keep the canonical and review surfaces aligned. */
export function ResearchAreaGrid({ tracks }: { tracks: Research["tracks"] }) {
  return <nav aria-label="Research areas" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 mb-16">
    {tracks.map(track => <article key={track.id} className="rounded-xl border border-cyan-400/15 bg-white/2 p-6">
      <h2 className="text-2xl font-display text-white"><a className={linkStyle} href={`/research/${track.overviewSlug}`}>{track.name}</a></h2>
      <p className="mt-4 text-base leading-relaxed text-text-dim">{track.description}</p>
      <p className="mt-4 text-base leading-relaxed text-text-dim"><strong className="text-white">Practical applications: </strong>{track.application}</p>
      <p className="mt-4 text-base leading-relaxed text-text-dim"><strong className="text-white">Availability: </strong>{track.availability}</p>
      <a className={`mt-5 inline-block text-sm ${linkStyle}`} href={`/research/${track.overviewSlug}`}>Explore research and limitations <span aria-hidden="true">→</span></a>
    </article>)}
  </nav>;
}

export function ResearchArticleEvidence({ publication }: { publication: Publication }) {
  return <aside aria-label="Research evidence and availability" className="mb-12 space-y-6 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-6 text-base text-text-dim leading-relaxed">
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
      <span className="font-semibold text-cyan-200">{publication.status}</span>
      <span>{publication.documentType.replaceAll("-", " ")}</span>
      <span>Reviewed <time dateTime={publication.reviewedAt}>{publication.reviewedAt}</time></span>
    </div>
    <p>{publication.statusNote}</p>
    <div><h2 className="font-display text-xl text-white mb-3">Limitations</h2><ul className="list-disc pl-5 space-y-2">{publication.limitations.map(item => <li key={item}>{item}</li>)}</ul></div>
    <div><h2 className="font-display text-xl text-white mb-3">Supporting sources</h2><ul className="space-y-3">{publication.sources.map(source => <li key={`${source.url}-${source.title}`}>
      <a className={linkStyle} href={source.url}>{source.title}</a>
      <span className="block text-sm mt-1">{source.kind} · revision <code className="break-all">{source.revision}</code></span>
    </li>)}</ul></div>
    {publication.attachments.length > 0 && <div><h2 className="font-display text-xl text-white mb-3">Downloads</h2><ul className="space-y-4">{publication.attachments.map(attachment => <li key={attachment.url}>
      <a href={attachment.url} download className={linkStyle}>{attachment.title} (PDF)</a>
      <p className="text-sm mt-1">{attachment.edition === "historical" ? "Historical edition" : "Current edition"} · {attachment.date} · {attachment.pages} pages</p>
      <p className="text-sm mt-1 break-all">SHA-256: <code>{attachment.sha256}</code></p>
    </li>)}</ul></div>}
  </aside>;
}

/** Explicitly renders structured text. Static exporters supply their own KaTeX renderer. */
export function ResearchArticleBody({ body, renderMath = tex => <BlockMath tex={tex} /> }: { body: Publication["body"]; renderMath?: (tex: string) => ReactNode }) {
  return <div className="space-y-12">{body.map((section, index) => <section key={index}>
    {section.heading && <h2 className="mb-5 text-2xl font-display font-bold text-white leading-tight">{section.heading}</h2>}
    <div className="space-y-5">{section.paragraphs.map((paragraph, i) => <p key={i} className="text-base md:text-lg text-text-dim leading-relaxed">{paragraph}</p>)}</div>
    {section.math && <div className="mt-6 space-y-3">{section.math.map((tex, i) => <div key={i} className="overflow-x-auto">{renderMath(tex)}</div>)}</div>}
    {section.code && <div className="mt-6 space-y-4">{section.code.map((block, i) => <figure key={i} className="overflow-hidden rounded-lg border border-white/10 bg-white/2">
      {block.file && <figcaption className="border-b border-white/10 px-4 py-2 font-mono text-sm text-text-dim">{block.file}</figcaption>}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-cyan-50" tabIndex={0} aria-label={block.file ?? "Code example"}><code>{block.code}</code></pre>
    </figure>)}</div>}
    {section.list && <ul className="mt-6 list-disc pl-5 space-y-3 text-base text-text-dim leading-relaxed">{section.list.map((item, i) => <li key={i}>{item}</li>)}</ul>}
  </section>)}</div>;
}
