import { createMDX } from 'fumadocs-mdx/next';
const withMDX = createMDX();
/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  async headers() {
    return [{source:'/:path*',headers:[
      {key:'X-Content-Type-Options',value:'nosniff'},
      {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
      {key:'X-Frame-Options',value:'DENY'},
      ...(process.env.SITE_INDEXABLE === 'true' && process.env.SITE_URL ? [] : [{key:'X-Robots-Tag',value:'noindex, nofollow'}])
    ]}];
  }
};
export default withMDX(config);
