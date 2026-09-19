import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ResearchAreaGrid, ResearchArticleBody, ResearchArticleEvidence } from '../components/research';
import type { Research } from '../data/schemas';

const publication: Research['publications'][number] = {
  slug: 'sample', title: 'Sample', tag: 'GUIDE', date: 'SEPTEMBER 2026', readTime: '2 min read', abstract: 'Abstract',
  topic: 'mcp', documentType: 'implementation-guide', practicalSummary: 'Useful integration guidance', status: 'Experimental',
  statusNote: 'Compatibility listener only', reviewedAt: '2026-09-06', limitations: ['No persistent SSE transport'],
  sources: [{ title: 'Handler source', url: 'https://example.org/source', revision: 'a'.repeat(40), kind: 'source' }],
  attachments: [{ title: 'Original paper', url: '/research/original.pdf', edition: 'historical', date: '2026-06-01', sha256: 'b'.repeat(64), pages: 2 }],
  body: [],
};

describe('shared research presentation', () => {
  it('renders inspectable evidence and historical downloads without router or browser dependencies', () => {
    const html = renderToStaticMarkup(<ResearchArticleEvidence publication={publication} />);
    for (const value of ['Experimental', 'implementation guide', '2026-09-06', 'No persistent SSE transport', 'https://example.org/source', 'Historical edition', '/research/original.pdf', 'b'.repeat(64)]) expect(html).toContain(value);
  });
  it('keeps article text visible in static output, escapes content, and allows a static math renderer', () => {
    const html = renderToStaticMarkup(<ResearchArticleBody body={[{ heading: 'Example', paragraphs: ['<script>bad()</script>'], math: ['x^2'], code: [{ file: 'demo.rs', code: 'a < b' }], list: ['Bounded'] }]} renderMath={tex => <span data-math={tex}>Equation</span>} />);
    expect(html).toContain('&lt;script&gt;'); expect(html).not.toContain('<script>');
    expect(html).toContain('data-math="x^2"'); expect(html).toContain('a &lt; b');
    expect(html).toContain('tabindex="0"'); expect(html).not.toContain('opacity:0');
  });
  it('renders an accessible overview link with applications and availability', () => {
    const html = renderToStaticMarkup(<ResearchAreaGrid tracks={[{ id: 'mcp', name: 'MCP', description: 'Tools', application: 'Integration', availability: 'Stdio', limitations: ['Custom HTTP'], overviewSlug: 'mcp-overview' }]} />);
    expect(html).toContain('aria-label="Research areas"'); expect(html).toContain('href="/research/mcp-overview"'); expect(html).toContain('Integration'); expect(html).toContain('Stdio');
  });
});
