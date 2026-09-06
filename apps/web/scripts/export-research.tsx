/**
 * Owner-private presentation artifact; canonical prose is never maintained here.
 * bun scripts/export-research.tsx --output /absolute/site --generated-at ISO_DATE
 * Repeat with the same source revision and timestamp for byte-identical public/.
 */
import React, { type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFile, writeFile, mkdir, cp, rm, readdir, lstat, realpath, mkdtemp, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import katex from 'katex';
import { research } from '../src/data/categories/research';
import { ResearchAreaGrid, ResearchArticleEvidence, ResearchArticleBody } from '../src/components/research';
import { projectResearch, publicationManifest, researchDigest, sha256, RESEARCH_CANONICAL_ORIGIN, RESEARCH_EXPORT_VERSION } from '../src/lib/research-export';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
function argument(name: string) { const i = args.indexOf(name); return i < 0 ? undefined : args[i + 1]; }
const destination = argument('--output');
if (!destination || !path.isAbsolute(destination)) throw new Error('--output must name an absolute generated Sites project directory');
const stamp = argument('--generated-at') ?? new Date().toISOString();
if (!Number.isFinite(Date.parse(stamp))) throw new Error('--generated-at must be a date');
const generatedAt = new Date(stamp).toISOString();
const siteRoot = path.resolve(destination);
const canonicalRepo = path.resolve(root, '../..');
if (siteRoot === canonicalRepo || siteRoot.startsWith(canonicalRepo + path.sep) || canonicalRepo.startsWith(siteRoot + path.sep)) throw new Error('Output must be outside the canonical repository');
if (existsSync(siteRoot) && (await lstat(siteRoot)).isSymbolicLink()) throw new Error('Refusing a symlinked destination');
await mkdir(siteRoot, { recursive: true });
if (await realpath(siteRoot) !== siteRoot) throw new Error('Destination must use its real filesystem path');
const entries = await readdir(siteRoot);
const existingPackage = path.join(siteRoot, 'package.json');
const owned = existsSync(existingPackage) && JSON.parse(await readFile(existingPackage,'utf8')).name === 'mlai-research-review-artifact';
if (!owned && entries.some(name => name !== '.openai')) throw new Error('Refusing to modify an unrelated destination');
const published = path.join(siteRoot, 'public');
if (existsSync(published)) {
  if ((await lstat(published)).isSymbolicLink()) throw new Error('Refusing a symlinked public directory');
  const prior = JSON.parse(await readFile(path.join(published, 'research-manifest.json'), 'utf8'));
  if (!owned || prior.format !== 'mlai-research-review' || prior.version !== RESEARCH_EXPORT_VERSION) throw new Error('Refusing to replace an unrelated public directory');
}
const stage = await mkdtemp(path.join(siteRoot, '.research-export-'));
const output = path.join(stage, 'public');
try {
await mkdir(path.join(output, 'assets'), { recursive: true });
const data = projectResearch(research);
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const dirty = !!execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim();
const styleInput = path.join(root, 'src/index.css');
// Resolve font assets into the generated artifact rather than referencing node_modules.
const built = await postcss([tailwind({ base: root })]).process(await readFile(styleInput, 'utf8'), { from: styleInput, to: path.join(output, 'assets/lab.css') });
let css = built.css;
const fontUrls = [...css.matchAll(/url\((['"]?)([^)'"\s]+\.woff2?)\1\)/g)];
for (const [, , url] of fontUrls) {
  if (!url || /^(data:|https?:)/.test(url)) continue;
  const filename = path.basename(url);
  const candidates = [path.resolve(path.dirname(styleInput), url), path.resolve(output, 'assets', url), path.join(root, 'node_modules/@fontsource-variable/geist/files', filename)];
  const source = candidates.find(existsSync);
  if (!source) throw new Error(`Cannot resolve font ${filename}`);
  await cp(source, path.join(output, 'assets', filename));
  css = css.split(url).join(`/assets/${filename}`);
}
const extraCss = await readFile(path.join(root, 'scripts/research-preview.css'), 'utf8');
await writeFile(path.join(output, 'assets/lab.css'), css + '\n' + extraCss);
await cp(path.join(root, 'node_modules/katex/dist/katex.min.css'), path.join(output, 'assets/katex.min.css'));
await cp(path.join(root, 'node_modules/katex/dist/fonts'), path.join(output, 'assets/fonts'), { recursive: true });
await cp(path.join(root, 'public/mlai-mark.svg'), path.join(output, 'assets/mlai-mark.svg'));
for (const publication of data.publications) {
  for (const attachment of publication.attachments) {
    const bytes = await readFile(path.join(root, 'public', attachment.url));
    if (sha256(bytes) !== attachment.sha256) throw new Error(`Attachment digest mismatch: ${attachment.url}`);
    await mkdir(path.dirname(path.join(output, attachment.url)), { recursive: true });
    await writeFile(path.join(output, attachment.url), bytes);
  }
}
function shell(title: string, canonicalPath: string, content: ReactNode) {
  const html = renderToStaticMarkup(<html lang="en" className="dark"><head>
    <meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>{`${title} · MLAI Research`}</title><meta name="robots" content="noindex,nofollow"/>
    <meta name="description" content="Private review of MLAI research: practical applications, technical evidence, and implementation boundaries."/>
    <link rel="canonical" href={`${RESEARCH_CANONICAL_ORIGIN}${canonicalPath}`}/>
    <link rel="icon" href="/assets/mlai-mark.svg" type="image/svg+xml"/>
    <link rel="stylesheet" href="/assets/lab.css"/><link rel="stylesheet" href="/assets/katex.min.css"/>
    <link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
    <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <script src="/assets/filter.js" defer/>
  </head><body><a className="preview-skip" href="#main">Skip to content</a>
    <div className="preview-banner">Private review copy · Research collection</div>
    <header className="preview-header"><a href="/research" className="preview-brand"><img src="/assets/mlai-mark.svg" width="32" height="32" alt=""/>MLAI <span>Research</span></a><a href={`${RESEARCH_CANONICAL_ORIGIN}/research`}>Canonical website ↗</a></header>
    <main id="main" tabIndex={-1} className="preview-main">{content}</main>
    <footer className="preview-footer">MLAI Research · Practical ideas, inspectable evidence.<br/>This private edition is generated from the canonical research collection.</footer>
  </body></html>);
  return '<!doctype html>\n' + html;
}
const tags = ['All', ...new Set(data.publications.map((p) => p.tag))];
const index = shell('Research collection', '/research', <>
  <div className="preview-intro"><p className="preview-eyebrow">MLAI Research</p><h1>Research you can build on.</h1><p>Explore the ideas behind MLAI’s AI systems, memory, evidence selection, and developer tools. Start with the practical application, then examine the research and its limits.</p></div>
  <ResearchAreaGrid tracks={data.tracks}/>
  <section className="preview-publications" aria-labelledby="publications-heading"><div className="preview-section-title"><h2 id="publications-heading">The research collection</h2><span>{data.publications.length} articles and guides</span></div>
    <div role="group" aria-label="Filter publications by tag" className="preview-filters">{tags.map(tag=><button type="button" key={tag} data-filter={tag} aria-pressed={tag==='All'}>{tag}</button>)}</div>
    <ul className="preview-paper-list">{data.publications.map(p=><li key={p.slug} data-publication-tag={p.tag}><a href={`/research/${p.slug}`}><div className="preview-paper-meta"><span>{p.documentType.replaceAll('-', ' ')} · {p.status}</span><span>{p.readTime}</span></div><h3>{p.title}</h3><p>{p.practicalSummary}</p></a></li>)}</ul>
    <p role="status" id="publication-status">{data.publications.length} publications shown.</p>
  </section>
</>);
await mkdir(path.join(output, 'research'), { recursive: true });
await writeFile(path.join(output, 'index.html'), index);
await writeFile(path.join(output, 'research/index.html'), index);
for (const publication of data.publications) {
  const math = (tex: string) => <div className="preview-math" dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { displayMode: true, throwOnError: true, trust: false, output: 'htmlAndMathml' }) }}/>;
  const body = shell(publication.title, `/research/${publication.slug}`, <article className="preview-article"><a href="/research" className="preview-back">← All research</a><p className="preview-eyebrow">{publication.documentType.replaceAll('-', ' ')} · {publication.status}</p><h1>{publication.title}</h1><p className="preview-lede">{publication.practicalSummary}</p><p className="preview-byline">{publication.authors} · {publication.date} · {publication.readTime}</p><ResearchArticleEvidence publication={publication}/><ResearchArticleBody body={publication.body} renderMath={math}/></article>);
  const directory = path.join(output, 'research', publication.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), body);
}
await writeFile(path.join(output, 'assets/filter.js'), await readFile(path.join(root, 'scripts/research-preview-filter.js')));
await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
await writeFile(path.join(output, '404.html'), shell('Page not found', '/research', <div className="preview-intro"><h1>That research page is not here.</h1><p><a href="/research">Browse the research collection</a></p></div>));
await writeFile(path.join(output, 'research-data.json'), JSON.stringify(data, null, 2)+'\n');
async function files(directory: string): Promise<string[]> {
  const paths: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await files(full)); else paths.push(full);
  }
  return paths.sort();
}
const hashes: Record<string,string> = {};
for (const file of await files(output)) hashes[path.relative(output, file)] = sha256(await readFile(file));
await writeFile(path.join(output, 'research-manifest.json'), JSON.stringify({ format:'mlai-research-review',version:RESEARCH_EXPORT_VERSION,sourceRevision:revision,sourceDirty:dirty,generatedAt,canonicalOrigin:RESEARCH_CANONICAL_ORIGIN,contentSha256:researchDigest(data),topics:data.tracks.map(t=>t.id),publications:publicationManifest(data),files:hashes },null,2)+'\n');
await writeFile(path.join(stage,'package.json'), JSON.stringify({name:'mlai-research-review-artifact',private:true,description:'Generated static artifact. Edit research source in the canonical MLAI repository; do not edit this snapshot.',scripts:{build:"node -e \"const fs=require('node:fs'); fs.rmSync('out',{recursive:true,force:true}); fs.cpSync('public','out',{recursive:true});\""}},null,2)+'\n');
await writeFile(path.join(stage,'README.md'), `# MLAI Research private review\n\nGenerated from canonical MLAI source ${revision}.\n\nThe public/ directory contains the exact approved structured research collection and shared renderers. No runtime secrets, production APIs or independent prose. Rebuild with the canonical scripts/export-research.tsx; see public/research-manifest.json for provenance.\n\nRun bun run build to stage the unchanged static bytes into out/ for Sites packaging. Configure .openai/hosting.json static.directory as out. The out/ directory is disposable build output.\n`);
// Publish only a completely generated artifact; keep the previous usable tree on failure.
const backup = path.join(stage, 'previous-public');
if (existsSync(published)) await rename(published, backup);
try {
  await rename(output, published);
  await rename(path.join(stage,'package.json'), path.join(siteRoot,'package.json'));
  await rename(path.join(stage,'README.md'), path.join(siteRoot,'README.md'));
} catch (error) {
  if (existsSync(backup)) {
    if (existsSync(published)) await rm(published,{recursive:true});
    await rename(backup,published);
  }
  throw error;
}
console.log(`Exported ${data.tracks.length} areas, ${data.publications.length} publications to ${published}; content ${researchDigest(data)}`);
} finally { await rm(stage, {recursive:true, force:true}); }
