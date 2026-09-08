const fs=require('node:fs'),path=require('node:path');
const {ts,register}=require('./ts-loader.cjs');register();
const {render,escape}=require('./review-renderer.cjs');
const {PageView,pageTitle,pageDescription}=require('../components/page-view.tsx');
const {h}=require('./review-renderer.cjs');
const {routes}=require('../lib/content.ts');
const root=path.resolve(__dirname,'..'),out=path.join(root,'review');fs.mkdirSync(out,{recursive:true});
const css=fs.readFileSync(path.join(root,'app/site.css'),'utf8');
const modules=['content','logic','enhance'].map(id=>{
 const src=fs.readFileSync(path.join(root,`lib/${id}.ts`),'utf8');
 const result=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 return `${JSON.stringify('./'+id)}:function(require,module,exports){${result}\n}`;
}).join(',\n');
const bundle=`(function(){'use strict';const modules={${modules}};const cache={};function require(id){if(cache[id])return cache[id].exports;const module={exports:{}};cache[id]=module;modules[id](require,module,module.exports);return module.exports;}window.MlaiMount=require('./enhance').mount;})();`;
const favicon='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#255c3e"/><path d="M7 24V8l9 12 9-12v16" fill="none" stroke="#fff" stroke-width="3"/></svg>');
const theme=`try{const t=localStorage.getItem('mlai-theme');document.documentElement.dataset.theme=(t==='dark'||t==='light')?t:matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';}catch{}`;
function frame(title,body,js,description=pageDescription('/')){return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="description" content="${escape(description)}"><title>${escape(title)}</title><link rel="icon" href="${favicon}"><script>${theme}</script><style>${css}</style></head><body>${body}<script>${js.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;}
const pages={};for(const route of [...routes,'/404/']){const html=render(h(PageView,{path:route}));pages[route]={html,title:pageTitle(route),description:pageDescription(route)};const target=route==='/404/'?path.join(out,'404.html'):path.join(out,route,'index.html');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,frame(pageTitle(route),html,bundle+'\nwindow.MlaiMount(document);',pageDescription(route)));}
const pageJson=JSON.stringify(pages).replace(/</g,'\\u003c');
const single=`${bundle}\n(function(){
const pages=${pageJson};let cleanup=null;const app=document.getElementById('review-app');
function url(){let value=location.hash.slice(1)||'/';if(!value.startsWith('/'))value='/';return new URL(value,'https://preview.invalid');}
window.__mlaiPreview={location:url,replaceQuery(query){const u=url();history.replaceState({},'',location.href.split('#')[0]+'#'+u.pathname+query);}};
function navigate(){if(cleanup)cleanup();const u=url();let route=u.pathname.endsWith('/')?u.pathname:u.pathname+'/';const page=pages[route]||pages['/404/'];app.innerHTML=page.html;document.title=page.title;document.querySelector('meta[name=description]').setAttribute('content',page.description);cleanup=window.MlaiMount(app);const anchor=u.searchParams.get('at');if(anchor){const el=document.getElementById(anchor);if(el){el.scrollIntoView({block:'start'});el.focus?.();}}else{window.scrollTo(0,0);document.getElementById('main')?.focus({preventScroll:true});}}
app.addEventListener('click',function(e){const a=e.target.closest('a');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank'||a.hasAttribute('download'))return;const target=a.getAttribute('href');if(!target)return;if(target.startsWith('/')){e.preventDefault();if(location.hash==='#'+target)navigate();else location.hash=target;}else if(target.startsWith('#')){e.preventDefault();const u=url();u.searchParams.set('at',target.slice(1));location.hash=u.pathname+u.search;}});
window.addEventListener('hashchange',navigate);navigate();})();`;
fs.writeFileSync(path.join(root,'MLAI-preview.html'),frame('MLAI — Intelligence, with intention.','<div id="review-app"></div><noscript>This single-file review needs JavaScript for navigation. The multi-page review in the source ZIP includes readable, pre-rendered content without JavaScript.</noscript>',single));
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({kind:'offline-review-not-next-build',routeCount:routes.length,routes,generatedAt:new Date().toISOString()},null,2));
console.log(`Rendered ${routes.length} routes + 404 from shared TSX. Wrote MLAI-preview.html.`);
