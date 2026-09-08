import { articles, projects, searchIndex, sources } from './content';
import { searchDocuments, filterProjects, validateBrief, formatBrief, safeFilename, type Brief } from './logic';

declare global { interface Window { __mlaiPreview?: { location:()=>URL; replaceQuery:(query:string)=>void }; MlaiMount?:typeof mount; } }
// Keep an in-memory preference when storage is unavailable (for example, private contexts).
let sessionTheme: string | null = null;

/** Small, cleanup-safe progressive enhancement for the shared server-rendered markup. */
export function mount(root:Document|HTMLElement = document):()=>void {
 const controller=new AbortController();const {signal}=controller;const timers:number[]=[];
 const $=<T extends Element=HTMLElement>(selector:string)=>root.querySelector<T>(selector);
 const $$=<T extends Element=HTMLElement>(selector:string)=>Array.from(root.querySelectorAll<T>(selector));
 const on=(el:EventTarget|null,type:string,fn:EventListener)=>el?.addEventListener(type,fn,{signal});
 const later=(fn:()=>void,ms:number)=>timers.push(window.setTimeout(fn,ms));
 const site=$<HTMLElement>('.site');
 const readLocation=()=>window.__mlaiPreview?.location()||new URL(window.location.href);
 const announce=(message:string)=>{const s=$('#site-status');if(s)s.textContent=message;};
 const safeFocus=(el:HTMLElement|null)=>{if(el?.isConnected&&el.getClientRects().length)el.focus();else $<HTMLElement>('.brand')?.focus();};

 // Only the optional color preference is persistent. Blocked storage is non-fatal.
 let theme:string|null=null;try{theme=localStorage.getItem('mlai-theme');}catch{}
 if(theme!=='dark'&&theme!=='light')theme=sessionTheme;
 const media=window.matchMedia('(prefers-color-scheme: dark)');
 let explicit=theme==='light'||theme==='dark';
 const setTheme=(dark:boolean)=>{document.documentElement.dataset.theme=dark?'dark':'light';$$('[data-theme-toggle]').forEach(b=>{b.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');b.setAttribute('title',dark?'Switch to light theme':'Switch to dark theme');});};
 setTheme(explicit?theme==='dark':media.matches);
 $$('[data-theme-toggle]').forEach(b=>on(b,'click',()=>{const dark=document.documentElement.dataset.theme!=='dark';setTheme(dark);explicit=true;sessionTheme=dark?'dark':'light';try{localStorage.setItem('mlai-theme',dark?'dark':'light');}catch{}announce(dark?'Dark theme enabled.':'Light theme enabled.');}));
 on(media,'change',()=>{if(!explicit)setTheme(media.matches);});

 // Native modal dialogs provide containment, Escape behavior, and inert background.
 const search=$<HTMLDialogElement>('#search-dialog'), menu=$<HTMLDialogElement>('#mobile-menu');
 let searchFocus:HTMLElement|null=null,menuFocus:HTMLElement|null=null;
 const input=$<HTMLInputElement>('#docs-search'),results=$('#search-results'),count=$('#search-count');
 let selected=0;
 function selectResult(index:number){const links=$$<HTMLAnchorElement>('#search-results a');if(!links.length){input?.removeAttribute('aria-activedescendant');return;}selected=(index+links.length)%links.length;links.forEach((a,i)=>a.setAttribute('aria-selected',String(i===selected)));input?.setAttribute('aria-activedescendant',links[selected].id);links[selected].scrollIntoView({block:'nearest'});}
 function renderSearch(){if(!input||!results||!count)return;const matches=searchDocuments(input.value,searchIndex);results.replaceChildren();selected=0;count.textContent=input.value.trim()?`${matches.length} ${matches.length===1?'result':'results'}`:'SUGGESTED STARTING POINTS';
  if(!matches.length){const p=document.createElement('p');p.className='empty-search';p.textContent='No guides match that search. Try “runtime”, “storage”, or “evidence”.';results.append(p);input.removeAttribute('aria-activedescendant');return;}
  matches.forEach((item,i)=>{const a=document.createElement('a');a.href=item.href;a.id=`search-result-${i}`;a.setAttribute('role','option');a.setAttribute('aria-selected',String(i===0));const group=document.createElement('span'),title=document.createElement('strong'),description=document.createElement('small');group.textContent=item.group;title.textContent=item.title;description.textContent=item.description;a.append(group,title,description);results.append(a);});input.setAttribute('aria-activedescendant','search-result-0');
 }
 function openSearch(){if(!search||search.open)return;if(menu?.open)menu.close();searchFocus=document.activeElement as HTMLElement;renderSearch();search.showModal();input?.focus();}
 $$('[data-open-search]').forEach(b=>on(b,'click',openSearch));
 on($('[data-close-search]'),'click',()=>search?.close());
 on(search,'close',()=>{safeFocus(searchFocus);});
 on(input,'input',renderSearch);
 on(input,'keydown',(event)=>{const e=event as KeyboardEvent;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();selectResult(selected+(e.key==='ArrowDown'?1:-1));}if(e.key==='Enter'){const link=$$<HTMLAnchorElement>('#search-results a')[selected];if(link){e.preventDefault();link.click();}}});
 on(results,'click',e=>{if((e.target as Element).closest('a'))search?.close();});
 on(document,'keydown',event=>{const e=event as KeyboardEvent;const el=e.target as HTMLElement;if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'&&!el.closest('input,textarea,select,[contenteditable=true]')){e.preventDefault();openSearch();}});
 $$('[data-open-menu]').forEach(b=>on(b,'click',()=>{if(!menu||menu.open)return;menuFocus=document.activeElement as HTMLElement;menu.showModal();b.setAttribute('aria-expanded','true');}));
 on($('[data-close-menu]'),'click',()=>menu?.close());
 on(menu,'close',()=>{$$('[data-open-menu]').forEach(b=>b.setAttribute('aria-expanded','false'));safeFocus(menuFocus);});
 on(menu,'click',e=>{if((e.target as Element).closest('nav a'))menu?.close();});
 const desktop=window.matchMedia('(min-width: 761px)');on(desktop,'change',()=>{if(desktop.matches&&menu?.open)menu.close();});
 for(const dialog of [search,menu])on(dialog,'click',e=>{if(e.target!==dialog||!dialog)return;const r=dialog.getBoundingClientRect(),m=e as MouseEvent;if(m.clientX<r.left||m.clientX>r.right||m.clientY<r.top||m.clientY>r.bottom)dialog.close();});
 // Keep keyboard traversal inside the page modal instead of cycling into browser chrome.
 for(const dialog of [search,menu])on(dialog,'keydown',event=>{
  const e=event as KeyboardEvent;if(!dialog)return;
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();dialog.close();return;}
  if(e.key!=='Tab')return;
  const items=Array.from(dialog.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(el=>el.getClientRects().length>0);
  if(!items.length){e.preventDefault();dialog.focus();return;}
  const first=items[0],last=items[items.length-1];
  if(e.shiftKey&&(document.activeElement===first||!items.includes(document.activeElement as HTMLElement))){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 });

 async function copy(text:string,status:HTMLElement|null,selectTarget?:HTMLElement|null){
  try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(text);if(status?.isConnected)status.textContent='Copied to clipboard.';return true;}
  catch{if(status?.isConnected)status.textContent='Clipboard access is blocked. Select the text below and copy it manually.';if(selectTarget){const range=document.createRange();range.selectNodeContents(selectTarget);const selection=window.getSelection();selection?.removeAllRanges();selection?.addRange(range);selectTarget.focus();}return false;}
 }
 $$('[data-copy]').forEach(b=>on(b,'click',()=>{const wrap=b.closest('.code-wrap');const pre=wrap?.querySelector<HTMLElement>('pre'),status=wrap?.querySelector<HTMLElement>('.copy-status');if(pre)void copy(pre.textContent||'',status||null,pre);}));
 on($('[data-copy-page]'),'click',()=>{const route=site?.dataset.route;const article=articles.find(a=>(a.slug?`/docs/${a.slug}/`:'/docs/')===route);if(!article)return;const text=[article.title,article.description,...article.sections.flatMap(s=>[s.title,...s.paragraphs,...(s.bullets||[]),s.code||'']),...article.sources.map(id=>`${sources[id].label}: ${sources[id].url}`)].join('\n\n');void copy(text,$('.page-copy-status'),$('#article-content'));});

 const mapDescriptions:Record<string,string>={abi:'Runtime foundations, local orchestration, and explicit capability reporting.',abbey:'Companion identity and interaction roles described by the ABI project.',wdbx:'Semantic storage and retrieval associated with the ABI workspace.'};
 $$('[data-map]').forEach(b=>on(b,'click',()=>{const id=b.dataset.map;const project=projects.find(p=>p.id===id);if(!id||!project)return;$$('[data-map]').forEach(node=>node.setAttribute('aria-pressed',String(node===b)));const label=$('[data-map-label]'),desc=$('[data-map-description]');if(label)label.textContent=`${project.name.toUpperCase()} / ${project.category.toUpperCase()}`;if(desc)desc.textContent=mapDescriptions[id];}));

 const projectInput=$<HTMLInputElement>('#project-search');let category='All';
 function syncProjects(write=false){if(!projectInput)return;const matches=filterProjects(projects,projectInput.value,category);$$('[data-project]').forEach(row=>row.hidden=!matches.some(p=>p.id===row.dataset.project));$$('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));const c=$('#project-count');if(c)c.textContent=`${matches.length} ${matches.length===1?'project':'projects'}`;const empty=$('#project-empty');if(empty)empty.hidden=matches.length>0;if(write){const u=readLocation();projectInput.value.trim()?u.searchParams.set('q',projectInput.value.trim()):u.searchParams.delete('q');category!=='All'?u.searchParams.set('category',category):u.searchParams.delete('category');if(window.__mlaiPreview)window.__mlaiPreview.replaceQuery(u.search);else window.history.replaceState({},'',u.pathname+u.search+u.hash);}}
 function loadFilters(){if(!projectInput)return;const u=readLocation();projectInput.value=(u.searchParams.get('q')||'').slice(0,200);const c=u.searchParams.get('category')||'All';category=['All',...projects.map(p=>p.category)].includes(c)?c:'All';syncProjects();}
 on(projectInput,'input',()=>syncProjects(true));$$('[data-category]').forEach(b=>on(b,'click',()=>{category=b.dataset.category||'All';syncProjects(true);}));on($('[data-reset-projects]'),'click',()=>{if(projectInput)projectInput.value='';category='All';syncProjects(true);projectInput?.focus();});on(window,'popstate',loadFilters);loadFilters();

 const form=$<HTMLFormElement>('#brief-form'),result=$('#brief-result'),output=$('#brief-output'),briefStatus=$('#brief-status');let current:Brief|null=null;
 const getBrief=():Brief=>{const data=new FormData(form!);return {title:String(data.get('title')||''),goal:String(data.get('goal')||''),area:String(data.get('area')||''),constraints:String(data.get('constraints')||'')};};
 const clearErrors=()=>{for(const key of ['title','goal','area','constraints']){const error=$(`#error-${key}`);if(error)error.textContent='';$(`#brief-${key}`)?.removeAttribute('aria-invalid');}};
 on(form,'submit',e=>{e.preventDefault();clearErrors();const b=getBrief(),errors=validateBrief(b);if(Object.keys(errors).length){for(const [key,message] of Object.entries(errors)){const error=$(`#error-${key}`);if(error)error.textContent=message;$(`#brief-${key}`)?.setAttribute('aria-invalid','true');}$<HTMLElement>(`#brief-${Object.keys(errors)[0]}`)?.focus();if(briefStatus)briefStatus.textContent='Check the highlighted fields.';return;}current=b;if(output)output.textContent=formatBrief(b);if(result)result.hidden=false;if(briefStatus)briefStatus.textContent='Prepared locally. Nothing has been sent.';$<HTMLElement>('#brief-result-title')?.focus();});
 on(form,'input',()=>{if(current){current=null;if(result)result.hidden=true;if(briefStatus)briefStatus.textContent='Your brief changed. Generate it again to update the result.';}});
 on(form,'reset',()=>{current=null;clearErrors();if(result)result.hidden=true;if(output)output.textContent='';if(briefStatus)briefStatus.textContent='Form cleared. No brief has been saved.';});
 on($('#brief-copy'),'click',()=>{if(current&&output)void copy(formatBrief(current),$('#brief-copy-status'),output);});
 on($('#brief-download'),'click',()=>{if(!current)return;const blob=new Blob([formatBrief(current)],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=safeFilename(current.title);a.click();later(()=>URL.revokeObjectURL(url),1500);const status=$('#brief-copy-status');if(status)status.textContent='Download prepared. Nothing was submitted.';});

 let observer:IntersectionObserver|undefined;
 if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(!visible)return;$$<HTMLAnchorElement>('.docs-toc a').forEach(a=>a.setAttribute('aria-current',String(a.getAttribute('href')===`#${visible.target.id}`)));},{rootMargin:'-100px 0px -60% 0px'});$$('#article-content h2[id]').forEach(h=>observer!.observe(h));}
 return ()=>{controller.abort();observer?.disconnect();timers.forEach(window.clearTimeout);for(const d of [search,menu])if(d?.open)d.close();};
}
