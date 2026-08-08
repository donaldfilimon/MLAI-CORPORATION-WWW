import { describe, expect, it } from "vitest";
import { buildRssFeed, collectFeedItems, escapeXml, parseContentDate } from "@/lib/feed";
import { content } from "@/data";
import { SITE_URL } from "@/lib/route-meta";

describe("feed", () => {
  it("escapes XML-sensitive characters", () => {
    expect(escapeXml(`a & b < c > "d" 'e'`)).toBe(
      "a &amp; b &lt; c &gt; &quot;d&quot; &apos;e&apos;",
    );
  });

  it("parses the human-readable content date formats", () => {
    expect(parseContentDate("June 9, 2026")).not.toBeNull();
    expect(parseContentDate("JUNE 2026")).not.toBeNull();
    expect(parseContentDate("not a date")).toBeNull();
  });

  it("includes every blog post and research publication exactly once", () => {
    const items = collectFeedItems();
    expect(items).toHaveLength(
      content.blog.length + content.research.publications.length,
    );
    const links = items.map((i) => i.link);
    expect(new Set(links).size).toBe(links.length);
    for (const post of content.blog) {
      expect(links).toContain(`${SITE_URL}/blog/${post.slug}`);
    }
    for (const pub of content.research.publications) {
      expect(links).toContain(`${SITE_URL}/research/${pub.slug}`);
    }
  });

  it("sorts newest-first by parsed date", () => {
    const stamps = collectFeedItems()
      .map((i) => i.timestamp)
      .filter((t): t is number => t !== null);
    const sorted = [...stamps].sort((a, b) => b - a);
    expect(stamps).toEqual(sorted);
  });

  it("emits well-formed RSS with a self link and no raw ampersands", () => {
    const xml = buildRssFeed(new Date("2026-08-08T00:00:00Z"));
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain(`<atom:link href="${SITE_URL}/feed.xml"`);
    expect(xml).toContain("<lastBuildDate>Sat, 08 Aug 2026 00:00:00 GMT</lastBuildDate>");
    // Every & must be part of an entity — a raw ampersand breaks feed readers.
    for (const match of xml.matchAll(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g)) {
      throw new Error(`raw ampersand at index ${match.index}`);
    }
    // Item count matches the content layer.
    const itemCount = (xml.match(/<item>/g) ?? []).length;
    expect(itemCount).toBe(content.blog.length + content.research.publications.length);
  });
});
