import { describe, it, expect } from 'vitest';
import { research } from '../data/categories/research';
import { projectResearch, publicationManifest, researchDigest } from '../lib/research-export';

describe('private research export contract', () => {
  it('preserves every publication and its full approved content', () => {
    expect(projectResearch(research)).toEqual(research);
    expect(publicationManifest(research).map(p=>p.slug)).toEqual(research.publications.map(p=>p.slug));
    expect(researchDigest(structuredClone(research))).toBe(researchDigest(research));
  });
  it('detects changed prose, source revisions, and downloads in the content commitment', () => {
    for (const mutation of ['prose','source','attachment']) {
      const changed = structuredClone(research);
      const paper = changed.publications[0]!;
      if (mutation==='prose') paper.body[0]!.paragraphs.push('Changed statement.');
      if (mutation==='source') paper.sources[0]!.revision='a'.repeat(40);
      if (mutation==='attachment') paper.attachments.push({title:'Test',url:'/research/test.pdf',edition:'current',date:'2026-09-06',sha256:'b'.repeat(64),pages:1});
      expect(researchDigest(changed)).not.toBe(researchDigest(research));
    }
  });
  it('rejects duplicate slugs, broken overview references, local citations and unsafe downloads', () => {
    const duplicate=structuredClone(research); duplicate.publications.push(duplicate.publications[0]!);
    expect(()=>projectResearch(duplicate)).toThrow(/duplicate/);
    const overview=structuredClone(research); overview.tracks[0]!.overviewSlug='missing-overview';
    expect(()=>projectResearch(overview)).toThrow(/overview/);
    const citation=structuredClone(research); citation.publications[0]!.sources[0]!.url='https://localhost/private';
    expect(()=>projectResearch(citation)).toThrow(/citation/);
    const attachment=structuredClone(research); attachment.publications[0]!.attachments.push({title:'Invalid',url:'/research/../private.pdf',edition:'current',date:'2026-09-06',sha256:'b'.repeat(64),pages:1});
    expect(()=>projectResearch(attachment)).toThrow(/attachment/);
  });
});
