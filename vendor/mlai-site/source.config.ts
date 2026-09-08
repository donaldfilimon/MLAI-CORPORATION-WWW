import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
// Config/entry API is used because the inspected 15.0.7 manifest does not expose /macro.
export const docs = defineDocs({ dir: 'content/docs' });
export default defineConfig({});
