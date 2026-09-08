import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { source } from '../../../lib/source';
import { articles } from '../../../lib/content';
import { Shell } from '../../../components/shell';
import { DocsPage } from '../../../components/docs';
type Props = {params:Promise<{slug?:string[]}>};
export const dynamicParams = false;
export function generateStaticParams(){return articles.map(a=>({slug:a.slug?[a.slug]:[]}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug=[]}=await params; const article=articles.find(a=>a.slug===slug.join('/'));
 return {title:article?`${article.title} · MLAI Docs`:'Page not found · MLAI',description:article?.description};
}
export default async function Page({params}:Props){
 const {slug=[]}=await params;const article=articles.find(a=>a.slug===slug.join('/'));
 const page=source.getPage(slug);
 if(!article||!page)notFound();
 const Content=page.data.body;
 const path=article.slug?`/docs/${article.slug}/`:'/docs/';
 return <Shell path={path}><DocsPage article={article} body={<Content/>}/></Shell>;
}
