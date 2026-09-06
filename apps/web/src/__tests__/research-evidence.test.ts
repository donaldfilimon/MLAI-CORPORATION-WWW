import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { research } from '../data/categories/research';
import { ResearchSchema } from '../data/schemas';

const LEGACY = [
  'wdbx-weighted-backtrace-memory-store', 'sparse-evidence-attention-context-assembly',
  'wdbx-graph-weights-traceable-retrieval', 'policy-locked-tool-use-multi-agent',
  'latency-budgets-real-time-orchestration', 'backtrace-confidence-signals-hallucination',
  'vector-index-maintenance-continuous-ingestion', 'human-approval-gates-operators-use',
  'chunk-provenance-long-context-retrieval', 'offline-first-ai-sensitive-data',
  'prompt-injection-drills-agentic-systems', 'multi-persona-routing-policy-weights',
];

describe('public research evidence contracts', () => {
  it('keeps all legacy URLs and supplies an overview for each of the six topics', () => {
    expect(() => ResearchSchema.parse(research)).not.toThrow();
    expect(new Set(research.tracks.map(t => t.id))).toEqual(new Set(['ai', 'gpu', 'mcp', 'sea', 'tui', 'wdbx']));
    for (const slug of LEGACY) expect(research.publications.some(p => p.slug === slug)).toBe(true);
    for (const track of research.tracks) {
      const overview = research.publications.find(p => p.slug === track.overviewSlug);
      expect(overview?.topic).toBe(track.id);
      expect(overview?.documentType).toBe('overview');
    }
    for (const topic of ['gpu', 'mcp', 'tui']) {
      expect(research.publications.some(p => p.topic === topic && p.documentType === 'implementation-guide')).toBe(true);
    }
  });

  it('retains substantive technical support and honest reading times behind short summaries', () => {
    for (const paper of research.publications) {
      const proseWords = paper.body.reduce((n, section) => n + section.paragraphs.join(' ').split(/\s+/).filter(Boolean).length, 0);
      const technicalAllowance = paper.body.reduce((n, section) => n + (section.math?.length ?? 0) * 20 + (section.code?.map(c => c.code).join(' ').split(/\s+/).filter(Boolean).length ?? 0), 0);
      if (paper.documentType !== 'overview') expect(proseWords).toBeGreaterThan(250);
      expect(paper.readTime).toBe(`${Math.max(1, Math.ceil((proseWords + technicalAllowance) / 200))} min read`);
    }
    for (const slug of ['wdbx-weighted-backtrace-memory-store', 'sparse-evidence-attention-context-assembly', 'multi-persona-routing-policy-weights']) {
      expect(research.publications.find(p => p.slug === slug)?.body.some(s => (s.math?.length ?? 0) > 0)).toBe(true);
    }
  });

  it('pins evidence to immutable public source revisions and rejects unclassified claims', () => {
    for (const paper of research.publications) {
      expect(paper.statusNote.trim().length).toBeGreaterThan(20);
      expect(paper.practicalSummary.trim().length).toBeGreaterThan(20);
      expect(paper.limitations.length).toBeGreaterThan(0);
      for (const source of paper.sources) {
        expect(source.url).toMatch(new RegExp(`^https://github\\.com/donaldfilimon/(abi|wdbx)/blob/${source.revision}/`));
      }
    }
    const missingSources = { ...research, publications: [{ ...research.publications[0], sources: [] }] };
    expect(ResearchSchema.safeParse(missingSources).success).toBe(false);
    const unsupportedStatus = { ...research, publications: [{ ...research.publications[0], status: 'Production ready' }] };
    expect(ResearchSchema.safeParse(unsupportedStatus).success).toBe(false);
  });

  it('keeps proposed outcome studies distinct from implementation notes', () => {
    for (const slug of ['backtrace-confidence-signals-hallucination', 'human-approval-gates-operators-use', 'latency-budgets-real-time-orchestration', 'prompt-injection-drills-agentic-systems']) {
      expect(research.publications.find(p => p.slug === slug)?.status).toBe('Proposed');
    }
    const gpu = research.publications.find(p => p.slug === 'gpu-overview');
    expect(gpu?.limitations.join(' ')).toContain('CUDA and Vulkan dispatch are not linked');
    const mcp = research.publications.find(p => p.slug === 'mcp-overview');
    expect(mcp?.limitations.join(' ')).toContain('not a persistent conforming MCP HTTP+SSE');
  });

  it('binds current and historical PDF links to exact bytes and preserves historical URLs', () => {
    for (const slug of ['wdbx-weighted-backtrace-memory-store', 'multi-persona-routing-policy-weights']) {
      const paper = research.publications.find(p => p.slug === slug)!;
      expect(paper.attachments.map(a => a.edition)).toEqual(['current', 'historical']);
      expect(paper.attachments.find(a => a.edition === 'historical')?.url).toBe(`/research/${slug}.pdf`);
      for (const attachment of paper.attachments) {
        expect(attachment.url).toMatch(/^\/research\/[a-z0-9-]+\.pdf$/);
        const bytes = readFileSync(resolve(process.cwd(), 'public', attachment.url.slice(1)));
        expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
        expect(createHash('sha256').update(bytes).digest('hex')).toBe(attachment.sha256);
        expect(attachment.pages).toBeGreaterThan(0);
      }
    }
  });
});
