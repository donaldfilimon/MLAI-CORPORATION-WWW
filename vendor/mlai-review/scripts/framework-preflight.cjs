/* Report blockers, never manufacture a lockfile or claim a review export is Next.js. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const required = ['next/package.json', 'react/package.json', 'react-dom/package.json', 'fumadocs-core/source', 'fumadocs-mdx/macro', 'fumadocs-mdx/next', '@types/mdx/package.json'];
const missing = required.filter(name => { try { require.resolve(name, { paths: [root] }); return false; } catch { return true; } });
const locks = ['bun.lock', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'];
const lock = locks.find(name => fs.existsSync(path.join(root, name)));
const [major, minor] = process.versions.node.split('.').map(Number);
const errors = [];
if (major < 20 || (major === 20 && minor < 9)) errors.push('Node.js 20.9 or later is required.');
if (!lock) errors.push('No resolved lockfile is present. Install the declared dependencies and review the real lockfile before release.');
if (missing.length) errors.push('Dependencies not installed: ' + missing.join(', '));
if (errors.length) { console.error('FRAMEWORK VERIFICATION BLOCKED\n' + errors.map(error => '- ' + error).join('\n')); process.exitCode = 1; }
else console.log(`Dependency preflight passed with ${lock}. Full type checking and next build must still run.`);
