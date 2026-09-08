import { projects, articles } from '../lib/content';
import { Shell } from './shell';
import { Home } from './home';
import { ProjectDirectory, ProjectDetail } from './projects';
import { DocsPage } from './docs';
import { AboutPage, TrustPage, BriefPage, NotFound } from './secondary';
export function pageTitle(path:string):string {
 if(path==='/')return 'MLAI — Intelligence, with intention.';
 if(path==='/projects/')return 'Projects · MLAI';
 if(path==='/trust/')return 'Trust & evidence · MLAI';
 if(path==='/about/')return 'About · MLAI';
 if(path==='/brief/')return 'Project brief · MLAI';
 const p=projects.find(p=>path===`/projects/${p.id}/`);if(p)return `${p.name} · MLAI`;
 const a=articles.find(a=>path===(a.slug?`/docs/${a.slug}/`:'/docs/'));if(a)return `${a.title} · MLAI Docs`;
 return 'Page not found · MLAI';
}
export function pageDescription(path:string):string {
 const project=projects.find(p=>path===`/projects/${p.id}/`);if(project)return project.description;
 const article=articles.find(a=>path===(a.slug?`/docs/${a.slug}/`:'/docs/'));if(article)return article.description;
 const summaries:Record<string,string>={
  '/':'Explore MLAI’s work in local AI systems, semantic memory, and developer tools. Start with clear roles and inspectable source.',
  '/projects/':'Find ABI, WDBX, Abbey, and Gama. Compare their roles and follow a guide to the upstream source.',
  '/trust/':'Understand the evidence behind project claims and the limitations of this documentation review.',
  '/about/':'Donald Filimon’s public software work and the relationship between this review and the existing MLAI platform.',
  '/brief/':'Prepare a focused project brief locally in your browser. Nothing is submitted or saved remotely.'
 };
 return summaries[path]||'This page was not found. Explore the MLAI projects and documentation.';
}
export function PageView({path}:{path:string}){
 let content;
 if(path==='/')content=<Home/>;
 else if(path==='/projects/')content=<ProjectDirectory/>;
 else if(path==='/trust/')content=<TrustPage/>;
 else if(path==='/about/')content=<AboutPage/>;
 else if(path==='/brief/')content=<BriefPage/>;
 else {
  const project=projects.find(p=>path===`/projects/${p.id}/`);
  const article=articles.find(a=>path===(a.slug?`/docs/${a.slug}/`:'/docs/'));
  content=project?<ProjectDetail project={project}/>:article?<DocsPage article={article}/>:<NotFound/>;
 }
 return <Shell path={path}>{content}</Shell>;
}
