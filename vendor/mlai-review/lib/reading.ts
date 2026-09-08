import type { Article } from './content';
export type SourceReference = { title: string; url: string; scope: string };
export function estimateReadingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
export function articleText(article: Article): string {
  return [article.title, article.description, ...article.sections.flatMap(section => [section.title, ...section.paragraphs, section.note || ''])].join('\n\n');
}
/** A portable document derived from canonical content, not copied from rendered chrome. */
export function articleMarkdown(article: Article, sources: Record<string, SourceReference>): string {
  const blocks = [`# ${article.title}`, article.description];
  for (const section of article.sections) {
    blocks.push(`## ${section.title}`, ...section.paragraphs);
    if (section.code) {
      const longestRun = Math.max(2, ...(section.code.match(/`+/g) || []).map(value => value.length));
      const fence = '`'.repeat(longestRun + 1);
      blocks.push(`${fence}sh\n${section.code}\n${fence}`);
    }
    if (section.note) blocks.push(section.note.split('\n').map(line => '> ' + line).join('\n'));
  }
  blocks.push('## Follow the source');
  for (const id of article.sources) {
    const source = sources[id];
    if (source) blocks.push(`- [${source.title}](${source.url}) — ${source.scope}`);
  }
  blocks.push('---\nExported from the independent MLAI review. Source descriptions are not independently reproduced test results.');
  return blocks.join('\n\n') + '\n';
}
export function safeDownloadName(title: string, suffix: string): string {
  return (title.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'mlai-document') + suffix;
}
