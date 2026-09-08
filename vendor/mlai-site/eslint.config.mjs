import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([
  ...nextVitals, ...nextTs,
  // Plain anchors are intentional: pure markup is shared with an independent HTML review.
  {rules:{'@next/next/no-html-link-for-pages':'off','no-empty':['error',{allowEmptyCatch:true}]}},
  globalIgnores(['.next/**','.source/**','review/**','next-env.d.ts'])
]);
