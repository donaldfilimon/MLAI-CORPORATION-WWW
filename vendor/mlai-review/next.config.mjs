import { createMDX } from 'fumadocs-mdx/next';
// Framework/MDX integration must pass a real install and build before deployment.
const withMDX = createMDX();
export default withMDX({
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
});
