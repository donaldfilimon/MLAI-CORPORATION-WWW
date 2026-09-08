import type { MetadataRoute } from 'next';
export default function robots():MetadataRoute.Robots {
 const enabled=process.env.SITE_INDEXABLE==='true'&&!!process.env.SITE_URL;
 return {rules:enabled?{userAgent:'*',allow:'/'}:{userAgent:'*',disallow:'/'},...(enabled?{sitemap:new URL('/sitemap.xml',process.env.SITE_URL!).href}:{})};
}
