import type { MetadataRoute } from 'next';
/** The review must not compete with the owner's existing production site. */
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: '*', disallow: '/' } }; }
