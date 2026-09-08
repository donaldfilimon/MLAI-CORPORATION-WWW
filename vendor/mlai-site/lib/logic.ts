import type { SearchEntry, Project } from './content';
export function searchDocuments(query: string, entries: SearchEntry[]): SearchEntry[] {
 const tokens = query.trim().toLocaleLowerCase().split(/\s+/u).filter(Boolean).slice(0,12);
 if (!tokens.length) return entries.slice(0,6);
 return entries.map((entry,index)=>{
  const title=entry.title.toLocaleLowerCase(),description=entry.description.toLocaleLowerCase(),body=entry.body.toLocaleLowerCase();
  if(!tokens.every(t=>`${title} ${description} ${body}`.includes(t))) return {entry,index,score:0};
  return {entry,index,score:tokens.reduce((n,t)=>n+(title.includes(t)?10:0)+(description.includes(t)?4:0)+(body.includes(t)?1:0),0)};
 }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,10).map(r=>r.entry);
}
export function filterProjects(items: Project[], query:string, category:string): Project[] {
 const q=query.trim().toLocaleLowerCase();
 return items.filter(p=>(category==='All'||p.category===category)&&`${p.name} ${p.description} ${p.role}`.toLocaleLowerCase().includes(q));
}
export interface Brief { title: string; goal: string; area: string; constraints: string; }
export function validateBrief(input: Brief): Record<string,string> {
 const errors: Record<string,string>={};
 if(input.title.trim().length<3) errors.title='Use at least 3 characters for the project title.';
 else if(input.title.length>120) errors.title='Keep the title within 120 characters.';
 if(input.goal.trim().length<15) errors.goal='Describe the goal in at least 15 characters.';
 else if(input.goal.length>2000) errors.goal='Keep the goal within 2,000 characters.';
 if(input.constraints.length>1500) errors.constraints='Keep constraints within 1,500 characters.';
 if(!['ABI','WDBX','Abbey','Gama','Other'].includes(input.area)) errors.area='Choose one of the listed project areas.';
 return errors;
}
export function formatBrief(b:Brief):string {
 return `PROJECT BRIEF\n${b.title.trim()}\n\nArea: ${b.area}\n\nGOAL\n${b.goal.trim()}\n\nCONSTRAINTS\n${b.constraints.trim()||'None specified.'}\n\nPrepared locally. Nothing has been submitted.`;
}
export function safeFilename(title:string):string {
 return (title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'project')+'-brief.txt';
}
