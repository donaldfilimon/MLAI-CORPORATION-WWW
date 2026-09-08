import type { MetadataRoute } from 'next';
import { routes } from '../lib/content';
export default function sitemap():MetadataRoute.Sitemap {
 if(process.env.SITE_INDEXABLE!=='true'||!process.env.SITE_URL)return [];
 return routes.map(path=>({url:new URL(path,process.env.SITE_URL).href}));
}
