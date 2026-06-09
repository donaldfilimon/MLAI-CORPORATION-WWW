/**
 * Generates public/sitemap.xml from the content data layer so detail pages
 * (blog posts, research papers, founder profiles) never drift out of sync.
 *
 * Run: bun run sitemap
 */
import { content } from "../src/data";

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
  { path: "/privacy", changefreq: "yearly", priority: "0.4" },
  { path: "/terms", changefreq: "yearly", priority: "0.4" },
  { path: "/security", changefreq: "yearly", priority: "0.4" },
];

const dynamicEntries: Entry[] = [
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

const body = entries
  .map(
    (e) =>
      `  <url><loc>${SITE}${e.path}</loc><lastmod>${lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

await Bun.write("public/sitemap.xml", xml);
console.log(`Wrote public/sitemap.xml with ${entries.length} URLs.`);
