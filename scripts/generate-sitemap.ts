/**
 * Generates public/sitemap.xml AND public/llms.txt from the content data
 * layer + route-meta titles/descriptions, so neither file can drift out of
 * sync with the actual route set (blog posts, research papers, founder
 * profiles, products). llms.txt follows the llmstxt.org convention: an H1,
 * a one-line blockquote summary, then H2 sections of `- [title](url):
 * description` links — the same titles/descriptions humans see in
 * <title>/<meta description>, just markdown instead of HTML.
 *
 * Run: bun run sitemap (also runs automatically as the first step of
 * `bun run build`).
 */
import { content } from "../src/data";
import { routeMetadata, DEFAULT_ROUTE_META } from "../src/lib/route-meta";

const SITE = "https://mlai-corp.com";
const lastmod = new Date().toISOString().slice(0, 10);

type Entry = { path: string; changefreq: string; priority: string };

// Indexable static routes (noindex routes — login/console/profile/404 — excluded).
const staticEntries: Entry[] = [
  { path: "/", changefreq: "monthly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/research", changefreq: "monthly", priority: "0.9" },
  { path: "/services", changefreq: "monthly", priority: "0.9" },
  { path: "/team", changefreq: "monthly", priority: "0.7" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
  { path: "/docs", changefreq: "monthly", priority: "0.8" },
  { path: "/benchmarks", changefreq: "monthly", priority: "0.8" },
  { path: "/links", changefreq: "monthly", priority: "0.5" },
  { path: "/changelog", changefreq: "monthly", priority: "0.6" },
  { path: "/demo", changefreq: "monthly", priority: "0.7" },
  { path: "/showcase", changefreq: "monthly", priority: "0.8" },
  { path: "/showcase/film", changefreq: "monthly", priority: "0.6" },
  { path: "/showcase/trailer", changefreq: "monthly", priority: "0.6" },
  { path: "/showcase/mega", changefreq: "monthly", priority: "0.6" },
  { path: "/showcase/explainer", changefreq: "monthly", priority: "0.6" },
  { path: "/showcase/design", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy", changefreq: "yearly", priority: "0.4" },
  { path: "/terms", changefreq: "yearly", priority: "0.4" },
  { path: "/security", changefreq: "yearly", priority: "0.4" },
];

const dynamicEntries: Entry[] = [
  ...content.products.map((p) => ({
    path: `/products/${p.slug}`,
    changefreq: "monthly",
    priority: "0.8",
  })),
  ...content.research.publications.map((p) => ({
    path: `/research/${p.slug}`,
    changefreq: "yearly",
    priority: "0.6",
  })),
  ...content.blog.map((p) => ({
    path: `/blog/${p.slug}`,
    changefreq: "yearly",
    priority: "0.6",
  })),
  ...content.team
    .filter((m) => m.slug)
    .map((m) => ({
      path: `/team/${m.slug}`,
      changefreq: "monthly",
      priority: "0.6",
    })),
];

const entries = [...staticEntries, ...dynamicEntries];

const sitemapBody = entries
  .map(
    (e) =>
      `  <url><loc>${SITE}${e.path}</loc><lastmod>${lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
  )
  .join("\n");

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapBody}
</urlset>
`;

await Bun.write("public/sitemap.xml", sitemapXml);
console.log(`Wrote public/sitemap.xml with ${entries.length} URLs.`);

// ── llms.txt ─────────────────────────────────────────────────────────────
type LlmLink = { title: string; path: string; description: string };

function link(path: string): LlmLink {
  const meta = routeMetadata[path] ?? DEFAULT_ROUTE_META;
  return { title: meta.title.split(" | ")[0] ?? meta.title, path, description: meta.description };
}

const marketing: LlmLink[] = [
  link("/"),
  link("/about"),
  link("/services"),
  link("/docs"),
  link("/benchmarks"),
  link("/security"),
].filter((l) => !routeMetadata[l.path]?.noindex);

const products: LlmLink[] = content.products.map((p) => ({
  title: p.name,
  path: `/products/${p.slug}`,
  description: p.intro,
}));

const research: LlmLink[] = content.research.publications.map((p) => ({
  title: p.title,
  path: `/research/${p.slug}`,
  description: p.abstract,
}));

const blog: LlmLink[] = content.blog.map((p) => ({
  title: p.title,
  path: `/blog/${p.slug}`,
  description: p.excerpt,
}));

const team: LlmLink[] = content.team
  .filter((m): m is typeof m & { slug: string } => Boolean(m.slug))
  .map((m) => ({
    title: m.name,
    path: `/team/${m.slug}`,
    description: m.tagline ?? `${m.role} at MLAI Corporation.`,
  }));

const legal: LlmLink[] = [link("/privacy"), link("/terms")];

function section(title: string, links: LlmLink[]): string {
  if (links.length === 0) return "";
  const items = links.map((l) => `- [${l.title}](${SITE}${l.path}): ${l.description}`).join("\n");
  return `\n## ${title}\n\n${items}\n`;
}

const llmsTxt = `# MLAI Corporation

> ${DEFAULT_ROUTE_META.description}

MLAI Corporation builds WDBX (a weighted-backtrace, hash-chained retrieval and
memory store) and the ABI runtime's Abbey/Aviva/Abi persona orchestration.
This file follows the llms.txt convention (https://llmstxt.org) so language
models and agentic crawlers can enumerate the site's real content without
scraping rendered HTML. Content claims here are load-bearing on the same
verifiable-architecture discipline as the rest of the site — see /docs and
the linked repositories for implementation detail.
${section("Platform", marketing)}${section("Products", products)}${section("Research", research)}${section("Lab Notes", blog)}${section("Team", team)}${section("Legal", legal)}
## Other machine-readable endpoints

- [Sitemap](${SITE}/sitemap.xml)
- [RSS feed — Lab Notes + Research](${SITE}/feed.xml)
- [robots.txt](${SITE}/robots.txt)
`;

await Bun.write("public/llms.txt", llmsTxt);
console.log(
  `Wrote public/llms.txt with ${marketing.length + products.length + research.length + blog.length + team.length + legal.length} links.`,
);
