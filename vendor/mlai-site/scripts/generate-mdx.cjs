const fs=require('node:fs'),path=require('node:path');
require('./ts-loader.cjs').register();
const {articles}=require('../lib/content.ts');
const root=path.resolve(__dirname,'../content/docs');fs.mkdirSync(root,{recursive:true});
let changed=0;
for(const a of articles){
 const parts=[`---\ntitle: ${JSON.stringify(a.title)}\ndescription: ${JSON.stringify(a.description)}\n---\n`,"import { CodeBlock } from '../../components/ui';\n"];
 for(const s of a.sections){
  parts.push(`<section className="doc-section">\n\n<h2 id=${JSON.stringify(s.id)}><a href=${JSON.stringify('#'+s.id)}>${s.title.replace(/&/g,'&amp;')}</a></h2>\n`);
  parts.push(...s.paragraphs.map(p=>p+'\n'));
  if(s.bullets)parts.push(s.bullets.map(b=>'- '+b).join('\n')+'\n');
  if(s.code)parts.push(`<CodeBlock code={${JSON.stringify(s.code)}}${s.note?' note={'+JSON.stringify(s.note)+'}':''} />\n`);
  parts.push('</section>\n');
 }
 const content=parts.join('\n'),file=path.join(root,(a.slug||'index')+'.mdx');
 if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==content){changed++;if(!process.argv.includes('--check'))fs.writeFileSync(file,content);}
}
if(process.argv.includes('--check')&&changed){console.error(`${changed} generated MDX pages differ from the content source.`);process.exitCode=1;}
else console.log(`${articles.length} MDX pages ${process.argv.includes('--check')?'match':'generated from'} the canonical typed content.`);
