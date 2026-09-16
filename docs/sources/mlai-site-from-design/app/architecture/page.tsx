import { Reveal } from '@/components/Motion';

export const metadata = {
  title: 'Architecture — Engineering Notes · MLAI',
  description: 'The full stack — HTTP, routing, templating, vector math — is pure Zig, cross-compiled to static binaries.',
};

const HTTP = [
  ['~32K req/s', 'cyan', 'std.http.Server', 'Post-Writergate std.Io.Reader/Writer interfaces. Adequate for moderate traffic; the baseline.'],
  ['~140K req/s', 'cyan', 'http.zig', 'Pure Zig HTTP/1.1 with routing, JSON, WebSockets, CORS, static files. dev branch tracks master.'],
  ['http.zig core', 'violet', 'Jetzig', 'Rails-like batteries: file routing, Zmpl templates, sessions, CSRF, jobs, HTMX.'],
  ['within 2% of gnet', 'emerald', 'zzz', 'io_uring / epoll / kqueue. Native TLS. Alpha quality, extraordinary ceiling.'],
] as const;

const DECISIONS = [
  ['01', 'TLS termination', 'std.crypto.tls.Server does not exist yet (zig#14171). Production terminates TLS at a reverse proxy (Caddy + Let’s Encrypt) or uses zzz’s native TLS.'],
  ['02', 'SSR without a framework tax', 'ArrayList(u8) writer for dynamic HTML, direct response-writer streaming for large pages, comptime concatenation for static fragments.'],
  ['03', 'SIMD-native vector math', '@Vector builtins compile distance kernels to the exact target ISA — AVX-512 on x86, NEON on Apple Silicon — with the same source.'],
  ['04', 'One build, every platform', 'zig build cross-compiles static binaries for macOS arm64/x86_64, Linux, and Windows. No container, no runtime, no GC.'],
] as const;

export default function ArchitecturePage() {
  return (
    <main>
      <section className="page-hero">
        <div className="neural-host" data-neural="galaxy" data-glow="0.7" data-density="0.9" data-chain="0"></div>
        <div className="veil"></div>
        <div className="wrap">
          <Reveal><div className="eyebrow">Engineering notes · Zig 0.17-dev</div></Reveal>
          <Reveal as="h1" delay={70}>The database <span className="grad-text">serves itself.</span></Reveal>
          <Reveal as="p" className="lede" delay={140}>WDBX serves itself. The full stack — HTTP, routing, templating, vector math — is pure Zig, cross-compiled to static binaries for every major platform from a single zig build.</Reveal>
        </div>
      </section>
      <section className="band">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">HTTP layer</div><h2>Framework selection, measured</h2><p className="sub">Throughput figures from community benchmarks on Apple M-series hardware.</p></Reveal>
          <div className="grid-2">
            {HTTP.map(([tag, tc, t, d], i) => (
              <Reveal key={t} delay={(i % 2) * 90} className="card glass"><div className={`tag ${tc}`}>{tag}</div><h3>{t}</h3><p className="desc">{d}</p></Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="band alt">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">Decisions</div><h2>Four calls that shaped the stack</h2></Reveal>
          <div className="vstack">
            {DECISIONS.map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 60} className="numrow glass"><div className="num">{n}</div><div><h3>{t}</h3><p>{d}</p></div></Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
