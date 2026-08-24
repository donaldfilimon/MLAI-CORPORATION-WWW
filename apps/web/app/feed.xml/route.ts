import { buildRssFeed } from "@/lib/feed";

/**
 * GET /feed.xml — RSS 2.0 for blog posts + research publications.
 * Content is static build-time data (src/data), so the route is statically
 * generated and re-rendered on deploy — same freshness model as the sitemap.
 */

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildRssFeed(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
