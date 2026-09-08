const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
require('../scripts/register.cjs');
const search=require('../lib/search.ts');
const {articles,sources,searchEntries}=require('../lib/content.ts');
const {render}=require('../scripts/serialize.cjs');
const {DocsPage}=require('../components/docs.tsx');
const {SearchDialog,Footer}=require('../components/chrome.tsx');
const {BriefPage,TrustPage}=require('../components/other.tsx');
const root=path.resolve(__dirname,'..');
const reading=fs.existsSync(path.join(root,'lib/reading.ts'))?require('../lib/reading.ts'):{};
function api(name){assert.equal(typeof search[name],'function',`${name} must exist`);return search[name];}
const records=[
 {url:'/docs/runtime/',title:'Runtime guide',description:'Understand execution.',body:'Runtime with optional CPU fallback.',group:'Documentation',sections:[{id:'cpu',title:'CPU fallback',text:'Capability reports accelerated=false when native kernels are absent.'}]},
 {url:'/docs/storage/',title:'Storage guide',description:'Retrieval concepts.',body:'Stored memory and search.',group:'Documentation'},
];
test('search normalizes both query and indexed Unicode text',()=>{
 assert.equal(search.searchDocuments('runtime',[{...records[0],title:'ＲＵＮＴＩＭＥ',description:'',body:''}]).length,1);
 assert.equal(search.searchDocuments('cafe',[{...records[0],title:'Café',description:'',body:''}]).length,1);
});
test('search supports multiple words in project query',()=>{
 assert.equal(search.matchProject('swift declarative','all',{name:'Gama',description:'A declarative framework written in Swift',category:'framework'}),true);
});
test('heading/body hits open the matching section',()=>{
 const result=api('searchPageResults')('native kernels',records);
 assert.equal(result.total,1); assert.equal(result.results[0].url,'/docs/runtime/#cpu');
 assert.match(result.results[0].excerpt,/native kernels/);
});
test('title hits keep the main project or guide destination',()=>{
 const result=api('searchPageResults')('Runtime guide',records);
 assert.equal(result.results[0].url,'/docs/runtime/');
});
test('search gives total count separately from visible result limit',()=>{
 const data=Array.from({length:17},(_,i)=>({...records[0],url:`/docs/g${i}/`,title:`Runtime ${i}`}));
 const result=api('searchPageResults')('runtime',data,10);
 assert.equal(result.total,17);assert.equal(result.results.length,10);
});
test('search safely bounds input and result limits without mutating records',()=>{
 const before=JSON.stringify(records);const result=api('searchPageResults')(' '.repeat(2000),records,0);
 assert.equal(result.results.length,0);assert.equal(JSON.stringify(records),before);
});
test('literal search punctuation cannot become a regex or HTML expression',()=>{
 const result=api('searchPageResults')('<img onerror=alert(1)>',records);
 assert.equal(result.total,0);
 const parts=api('highlightMatches')('The symbols a+b are literal.','a+b');
 assert.deepEqual(parts.filter(p=>p.match).map(p=>p.text),['a+b']);
 assert.equal(parts.map(p=>p.text).join(''),'The symbols a+b are literal.');
});
test('context excerpts show a deep body match instead of unrelated summary',()=>{
 const result=api('searchPageResults')('needle',[{...records[0],sections:[],body:'Start. '.repeat(80)+'needle in the content. '+'End. '.repeat(60)}]);
 assert.match(result.results[0].excerpt,/needle/);assert.ok(result.results[0].excerpt.length<240);
});
test('empty queries return intentional suggestions with no phantom matches',()=>{
 const result=api('searchPageResults')('',records);
 assert.equal(result.total,2);assert.equal(result.results.length,2);assert.equal(result.query,'');
});
test('unsafe URL records are never returned by local search',()=>{
 const result=api('searchPageResults')('runtime',[...records,{...records[0],url:'//untrusted.example/path'}]);
 assert.ok(result.results.every(r=>r.url.startsWith('/')&&!r.url.startsWith('//')));
});
test('search index includes code and section metadata for each guide',()=>{
 const entry=searchEntries.find(e=>e.url==='/docs/getting-started/');
 assert.ok(entry.sections?.length);assert.ok(entry.sections.some(s=>s.text.includes('./tools/cargo.sh')));
});
test('reading estimate is explicit, deterministic, and never zero',()=>{
 assert.equal(typeof reading.estimateReadingMinutes,'function');
 assert.equal(reading.estimateReadingMinutes(''),1);
 assert.equal(reading.estimateReadingMinutes('word '.repeat(440)),2);
});
test('article Markdown preserves actual code and source references',()=>{
 assert.equal(typeof reading.articleMarkdown,'function');
 const a=articles.find(a=>a.slug==='getting-started');const md=reading.articleMarkdown(a,sources);
 assert.ok(md.startsWith('# '+a.title));assert.match(md,/```sh\n/);assert.match(md,/\.\/tools\/cargo.sh/);
 assert.ok(md.includes(sources.abi.url));assert.ok(!md.includes('<section'));
});
test('docs render toolbar, progress, and a real mobile TOC',()=>{
 const html=render(DocsPage({article:articles[1]}));
 assert.match(html,/data-copy-article/);assert.match(html,/data-download-article/);
 assert.match(html,/data-reading-progress/);assert.match(html,/mobile-toc/);assert.match(html,/min read/);
});
test('search declares active-descendant navigation through a listbox',()=>{
 const html=render(SearchDialog());
 assert.match(html,/role="combobox"/);assert.match(html,/aria-controls="search-results"/);
 assert.match(html,/role="listbox"/);assert.match(html,/data-search-clear/);
});
test('brief is disabled in server HTML until submit handler is attached',()=>{
 const html=render(BriefPage());
 assert.match(html,/<fieldset[^>]*disabled[^>]*data-brief-fields|<fieldset[^>]*data-brief-fields[^>]*disabled/);
 assert.match(html,/<noscript>/);assert.match(html,/data-brief-counter/);
});
test('evidence ledger exposes search and reset with searchable records',()=>{
 const html=render(TrustPage());
 assert.match(html,/data-evidence-search/);assert.match(html,/data-evidence-reset/);
 assert.match(html,/data-evidence-text/);assert.match(html,/data-evidence-empty/);
});
test('theme has an explicit system preference path',()=>assert.match(render(Footer()),/data-theme-system/));
test('framework declares MDX types required by upstream setup',()=>{
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 assert.ok(pkg.devDependencies['@types/mdx']);assert.ok(pkg.scripts['check:review']);assert.ok(pkg.scripts['check:framework']);
});
