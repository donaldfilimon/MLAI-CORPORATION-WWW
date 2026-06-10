import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

type LinkItem = {
  title: string;
  body: string;
  href: string;
  label: string;
};

type LinkSection = {
  kicker: string;
  title: string;
  items: LinkItem[];
};

// Ported from the mlai-vite "link hub" concept: one reliable screen for the
// site's important doors. Internal routes render through the router; external
// links leave cleanly in a new tab. Every destination here is real.
const LINK_SECTIONS: LinkSection[] = [
  {
    kicker: "SOURCE",
    title: "Build from the source",
    items: [
      {
        title: "abi — runtime + WDBX",
        body: "The Zig runtime and weighted-backtrace store this site documents. CLI, MCP server, and CI gates live here.",
        href: "https://github.com/donaldfilimon/abi",
        label: "github.com/donaldfilimon/abi",
      },
      {
        title: "This site's source",
        body: "MLAI-CORPORATION-WWW — the Next.js app serving these pages, content layer and route handlers included.",
        href: "https://github.com/donaldfilimon/MLAI-CORPORATION-WWW",
        label: "github.com/donaldfilimon/MLAI-CORPORATION-WWW",
      },
      {
        title: "Founder on GitHub",
        body: "The wider project family — WDBX implementations, gama, and the rest of the public footprint.",
        href: "https://github.com/donaldfilimon",
        label: "github.com/donaldfilimon",
      },
    ],
  },
  {
    kicker: "READ",
    title: "Read and evaluate",
    items: [
      {
        title: "Research archive",
        body: "The WDBX and Sparse Evidence Attention papers, with the scoring math rendered as real equations.",
        href: "/research",
        label: "/research",
      },
      {
        title: "Developer docs",
        body: "ABI runtime, MCP tools, WDBX retrieval, and the Abbey–Aviva–Abi persona routing contract.",
        href: "/docs",
        label: "/docs",
      },
      {
        title: "Benchmarks",
        body: "Targets with operating context — what we engineer toward, framed honestly.",
        href: "/benchmarks",
        label: "/benchmarks",
      },
      {
        title: "Lab notes",
        body: "Shorter field notes — the hybrid ranker, SEA selection, persona weights, and Abbey in her own voice.",
        href: "/blog",
        label: "/blog",
      },
      {
        title: "Changelog",
        body: "Release history across the runtime, storage engine, and training stack — milestone markers, evidence-first.",
        href: "/changelog",
        label: "/changelog",
      },
      {
        title: "Hosted abi docs",
        body: "The generated documentation site for the abi repository, published from source.",
        href: "https://donaldfilimon.github.io/abi/",
        label: "donaldfilimon.github.io/abi",
      },
      {
        title: "Framework specification",
        body: "The canonical Abbey–Aviva–Abi framework spec, hosted with the abi docs.",
        href: "https://donaldfilimon.github.io/abi/spec/abbey-aviva-abi-framework.html",
        label: "abi/spec/abbey-aviva-abi-framework",
      },
    ],
  },
  {
    kicker: "EXPLORE",
    title: "Explore the product",
    items: [
      {
        title: "ABI Framework",
        body: "The deep-dive product page — orchestration, retrieval provenance, and the runtime surface.",
        href: "/products/abi",
        label: "/products/abi",
      },
      {
        title: "Abbey",
        body: "The persona system as a product: empathetic-polymath interface over governed execution.",
        href: "/products/abbey",
        label: "/products/abbey",
      },
      {
        title: "Live demo",
        body: "Run the WDBX miniature in your browser — cosine search, shard routing, and a hash-chained query log.",
        href: "/demo",
        label: "/demo",
      },
      {
        title: "Showcase",
        body: "The cinematic surfaces — film, trailer, and design lab experiments.",
        href: "/showcase",
        label: "/showcase",
      },
      {
        title: "Services",
        body: "Audit, architecture, and deployment engagements for teams shipping governed AI.",
        href: "/services",
        label: "/services",
      },
    ],
  },
  {
    kicker: "PEOPLE",
    title: "The person behind it",
    items: [
      {
        title: "Founder profile",
        body: "Donald Filimon — focus areas, signature work, and the engineering philosophy.",
        href: "/team/donald-filimon",
        label: "/team/donald-filimon",
      },
      {
        title: "donaldfilimon.com",
        body: "The founder's personal site.",
        href: "https://donaldfilimon.com",
        label: "donaldfilimon.com",
      },
      {
        title: "On X",
        body: "Updates and engineering notes in shorter form.",
        href: "https://x.com/donaldfilimonx",
        label: "@donaldfilimonx",
      },
    ],
  },
];

function LinkCard({ item }: { item: LinkItem }) {
  const external = item.href.startsWith("http");
  const inner = (
    <>
      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-text-dim/50">
        {external ? "External" : "Internal"}
      </span>
      <h3 className="mt-2 text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
        {item.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-text-dim">{item.body}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-indigo-400">
        {item.label}
        {external ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        )}
      </span>
    </>
  );

  const className = "glass-card group flex flex-col p-6";
  if (external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link to={item.href} className={className}>
      {inner}
    </Link>
  );
}

export const Links = () => {
  return (
    <section
      id="links"
      className="min-h-screen section-y bg-bg relative font-sans"
      aria-labelledby="links-heading"
    >
      <div className="container-custom pt-10">
        <PageHeader
          id="links-heading"
          tag="LINK HUB"
          title="Every important door, one screen."
          subtitle="Source repositories, reference docs, the founder's profile, and the product surfaces — grouped so the site has one reliable place for navigation."
        />

        <div className="space-y-16">
          {LINK_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="mb-6 flex items-baseline gap-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-indigo-400">
                  {section.kicker}
                </span>
                <h2 className="text-xl font-display font-bold text-white">
                  {section.title}
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((item) => (
                  <LinkCard item={item} key={item.title} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
