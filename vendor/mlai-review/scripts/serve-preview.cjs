/* Read-only loopback server for exported review pages, never a production runtime. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../preview');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
function createPreviewServer() {
  return http.createServer((req, res) => {
    const headers = {
      'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    };
    try {
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { ...headers, Allow: 'GET, HEAD' }); res.end('Read-only review server'); return; }
      const url = new URL(req.url, 'http://localhost');
      const requested = decodeURIComponent(url.pathname);
      if (requested.includes('\0') || requested.includes('\\')) throw new Error('Invalid path');
      let filename = path.resolve(root, '.' + requested);
      if (filename !== root && !filename.startsWith(root + path.sep)) throw new Error('Outside review root');
      if (fs.existsSync(filename) && fs.statSync(filename).isDirectory()) filename = path.join(filename, 'index.html');
      let status = 200;
      if (!fs.existsSync(filename) || !fs.statSync(filename).isFile() || !types[path.extname(filename)]) { status = 404; filename = path.join(root, '404.html'); }
      const real = fs.realpathSync(filename);
      if (!real.startsWith(fs.realpathSync(root) + path.sep)) throw new Error('Outside review root');
      const body = fs.readFileSync(real);
      const hashes = path.extname(real) === '.html' ? [...body.toString().matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(match => "'sha256-" + crypto.createHash('sha256').update(match[1]).digest('base64') + "'").join(' ') : '';
      headers['Content-Security-Policy'] = `default-src 'none'; script-src 'self' ${hashes}; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;
      res.writeHead(status, { ...headers, 'Content-Type': types[path.extname(real)], 'Content-Length': body.length });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch { res.writeHead(400, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Invalid request'); }
  });
}
if (require.main === module) {
  const port = Number(process.env.PORT || 4173);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535');
  createPreviewServer().listen(port, '127.0.0.1', () => console.log(`Review: http://127.0.0.1:${port} (not a Next.js server)`));
}
module.exports = { createPreviewServer };
