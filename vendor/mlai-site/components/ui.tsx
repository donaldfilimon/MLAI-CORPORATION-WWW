import type { ReactNode } from 'react';
import { sources, REVIEW_DATE, type SourceId } from '../lib/content';
const paths: Record<string,string> = {
 arrow:'M4 12h15M13 6l6 6-6 6', external:'M7 17 17 7M7 7h10v10', chevron:'m9 5 7 7-7 7',
 search:'m20 20-4.8-4.8M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
 menu:'M4 7h16M4 12h16M4 17h16',close:'m6 6 12 12M18 6 6 18',
 sun:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
 book:'M12 5v15M3 4h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v15h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3z',
 copy:'M9 8V3h12v14h-5M3 8h12v13H3z', code:'m8 7-5 5 5 5m8-10 5 5-5 5M14 3l-4 18',
 layers:'m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5',
 cube:'m12 3 9 5v9l-9 5-9-5V8zM3 8l9 5 9-5M12 13v9M7.5 5.5l9 5',
 storage:'M4 6c0-4 16-4 16 0s-16 4-16 0v12c0 4 16 4 16 0V6M4 12c0 4 16 4 16 0',
 companion:'M19 11a7 7 0 1 0-13 3L3 21l7-3a7 7 0 0 0 9-7zM8 9h6M8 12h4',
 terminal:'m5 7 5 5-5 5M13 17h6', check:'m5 12 4 4L19 6', down:'M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4'
};
export function Icon({name,className=''}:{name:string;className?:string}) {
 return <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]||paths.arrow}/></svg>;
}
export function Brand(){return <a className="brand" href="/" aria-label="MLAI home"><svg viewBox="0 0 32 32" width="29" height="29" fill="none" aria-hidden="true"><path d="M3 25V7l9 13L21 7v18M27 7v18" stroke="currentColor" strokeWidth="3.2" strokeLinecap="square" strokeLinejoin="miter"/></svg><span>MLAI<span className="brand-dot">.</span></span></a>}
export function Action({href,children,secondary=false,external=false}:{href:string;children:ReactNode;secondary?:boolean;external?:boolean}){
 return <a className={`button ${secondary?'secondary':''}`} href={href} {...(external?{target:'_blank',rel:'noopener noreferrer'}:{})}>{children}<Icon name={external?'external':'arrow'}/></a>;
}
export function CodeBlock({code,label='Shell',note}:{code:string;label?:string;note?:string}){
 return <div className="code-wrap"><div className="code-head"><span><Icon name="terminal"/>{label}</span><button type="button" data-copy="" className="copy-button"><Icon name="copy"/><span>Copy</span></button></div><pre tabIndex={0}><code>{code}</code></pre><p className="copy-status" aria-live="polite"></p>{note&&<p className="code-note">{note}</p>}</div>;
}
export function SourceRefs({ids}:{ids:SourceId[]}){
 return <section className="source-refs" aria-label="Source references"><h2>Source references</h2><p>Reviewed {REVIEW_DATE}. Documentation review is not runtime validation.</p>{ids.map(id=><a key={id} className="source-row" href={sources[id].url} target="_blank" rel="noopener noreferrer"><span><strong>{sources[id].label}</strong><small>{sources[id].scope}</small></span><Icon name="external"/></a>)}</section>;
}
