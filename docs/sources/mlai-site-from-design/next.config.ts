import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',          // static export, same as the v2.1 production site
  trailingSlash: true,       // emit folder/index.html so direct route hits resolve on any static host
  images: { unoptimized: true },
};

export default nextConfig;
