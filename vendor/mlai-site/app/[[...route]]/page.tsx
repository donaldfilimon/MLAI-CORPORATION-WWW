import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { routes } from '../../lib/content';
import { PageView, pageTitle, pageDescription } from '../../components/page-view';
const marketingRoutes = routes.filter(route => !route.startsWith('/docs/'));
type Props = {params: Promise<{route?:string[]}>};
export const dynamicParams = false;
export function generateStaticParams() { return marketingRoutes.map(path=>({route:path.split('/').filter(Boolean)})); }
export async function generateMetadata({params}:Props):Promise<Metadata> {
 const {route=[]}=await params; const path='/'+(route.length?route.join('/')+'/':'');
 return {title:pageTitle(path),description:pageDescription(path)};
}
export default async function Page({params}:Props) {
 const {route=[]}=await params;const path='/'+(route.length?route.join('/')+'/':'');
 if(!marketingRoutes.includes(path))notFound();
 return <PageView path={path}/>;
}
