import type { MetadataRoute } from 'next';
import { SITE_ORIGIN } from '@/lib/site';

export const dynamic = 'force-static';

const BASE = SITE_ORIGIN;

const ROUTES = [
  '', '/wdbx', '/abi', '/abbey', '/platform', '/services',
  '/research', '/architecture', '/company', '/investors', '/contact', '/docs',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}
