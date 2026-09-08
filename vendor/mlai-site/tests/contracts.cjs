const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
test('the approved site has actual typed content, not an empty scaffold', () => {
 assert.ok(fs.existsSync(path.join(root, 'lib/content.ts')), 'lib/content.ts is not implemented');
});
test('search and local brief logic are implemented', () => {
 assert.ok(fs.existsSync(path.join(root, 'lib/logic.ts')), 'lib/logic.ts is not implemented');
});
require('../scripts/ts-loader.cjs').register();
const {articles,projects,searchIndex,routes,sources}=require('../lib/content.ts');
const {searchDocuments,filterProjects,validateBrief,formatBrief,safeFilename}=require('../lib/logic.ts');
test('every route and article anchor is unique',()=>{
 assert.equal(new Set(routes).size,routes.length);
 for(const a of articles){assert.equal(new Set(a.sections.map(s=>s.id)).size,a.sections.length);assert.ok(a.sections.every(s=>s.paragraphs.length));}
});
test('all content references resolve to explicit HTTPS sources',()=>{
 for(const item of [...articles,...projects])for(const id of item.sources)assert.ok(sources[id].url.startsWith('https://'));
});
test('search handles whitespace, case, body matches, and no results safely',()=>{
 assert.equal(searchDocuments('  ABI Runtime  ',searchIndex)[0].title,'ABI runtime');
 assert.ok(searchDocuments('WAL',searchIndex).some(r=>r.href==='/docs/wdbx/'));
 assert.equal(searchDocuments('',searchIndex).length,6);
 assert.deepEqual(searchDocuments('no-such-document-xx',searchIndex),[]);
 assert.deepEqual(searchDocuments('<script>alert(1)</script>',searchIndex),[]);
});
test('project filters combine category and text without changing the source',()=>{
 assert.equal(filterProjects(projects,'swift','All')[0].id,'gama');
 assert.equal(filterProjects(projects,'','Storage').length,1);
 assert.equal(filterProjects(projects,'swift','Runtime').length,0);
 assert.equal(projects.length,4);
});
test('brief validates required fields and maximum lengths',()=>{
 assert.ok(validateBrief({title:'',goal:'',constraints:'',area:'Other'}).title);
 assert.ok(validateBrief({title:'Good',goal:'too short',constraints:'',area:'Other'}).goal);
 assert.ok(validateBrief({title:'a'.repeat(121),goal:'A sufficiently detailed objective',constraints:'',area:'Other'}).title);
 assert.ok(validateBrief({title:'Good',goal:'A sufficiently detailed objective',constraints:'',area:'bad'}).area);
});
test('brief preserves user text but generates a filesystem-safe name',()=>{
 const b={title:'A test project',goal:'Investigate a reproducible retrieval experiment.',constraints:'No live provider calls.',area:'WDBX'};
 assert.deepEqual(validateBrief(b),{});
 assert.ok(formatBrief(b).includes(b.constraints));
 assert.equal(safeFilename('../../Hello <script>'),'hello-script-brief.txt');
 assert.equal(safeFilename('!!!'),'project-brief.txt');
});
