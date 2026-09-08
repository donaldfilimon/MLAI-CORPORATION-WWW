/* Checks generated local HTML only; external source availability is a separate concern. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../preview');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const files = walk(root).filter(file => file.endsWith('.html'));
const read = new Map(files.map(file => [file, fs.readFileSync(file, 'utf8')]));
const decode = text => text.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
let links = 0, fragments = 0, assets = 0;
const errors = [];
for (const [file, html] of read) {
  const route = '/' + path.relative(root, file).replace(/index\.html$/, '').replaceAll(path.sep, '/');
  for (const match of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    const [, attribute, encoded] = match;
    const href = decode(encoded);
    if (!href.startsWith('/') && !href.startsWith('#')) continue;
    const url = new URL(href, 'http://review.local' + route);
    let target = path.join(root, decodeURIComponent(url.pathname));
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) { errors.push(`${route}: missing ${href}`); continue; }
    if (attribute === 'src' || !target.endsWith('.html')) { assets++; continue; }
    links++;
    if (url.hash) {
      fragments++;
      const id = decodeURIComponent(url.hash.slice(1));
      if (!(read.get(target) || '').includes('id="' + id + '"')) errors.push(`${route}: missing anchor ${href}`);
    }
  }
}
const result = { pages: files.length, links, fragments, assets, errors };
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
