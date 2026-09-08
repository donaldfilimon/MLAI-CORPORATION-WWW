import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContentIndex } from "../packages/ui/src/content-index";

describe("shared content index", () => {
  it("does not accept search input in an unhydrated research fallback", () => {
    const html = renderToStaticMarkup(
      <ContentIndex items={[]} searchDisabled />,
    );
    expect(html).toMatch(/<input[^>]*disabled=""/);
    expect(renderToStaticMarkup(<ContentIndex items={[]} />)).not.toContain(
      'disabled=""',
    );
  });
  it("keeps documentation defaults without optional research presentation", () => {
    const html = renderToStaticMarkup(
      <ContentIndex items={[]} query="absent" />,
    );
    expect(html).toContain("Search documentation");
    expect(html).toContain("No articles match “absent”");
    expect(html).toContain("0 articles found");
  });
  it("allows filter-aware empty state without a misleading empty quoted query", () => {
    const html = renderToStaticMarkup(
      <ContentIndex
        items={[]}
        emptyState={<p>No research matches these filters.</p>}
      />,
    );
    expect(html).toContain("No research matches these filters.");
    expect(html).not.toContain("No articles match");
  });
  it("renders optional evidence metadata and hides decorative arrows", () => {
    const html = renderToStaticMarkup(
      <ContentIndex
        items={[
          {
            href: "/study",
            title: "Study",
            description: "Evidence",
            category: "AI",
          },
        ]}
        renderMetadata={(item) => <span>Reference snapshot: {item.title}</span>}
      />,
    );
    expect(html).toContain("Reference snapshot: Study");
    expect(html).toMatch(
      /class="lucide lucide-arrow-right"[^>]*aria-hidden="true"/,
    );
  });
});
