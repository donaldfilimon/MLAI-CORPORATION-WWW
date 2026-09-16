import { Reveal } from '@/components/Motion';
import DocsInteractions from '@/components/DocsInteractions';

export const metadata = {
  title: 'Docs — Build on WDBX · MLAI',
  description: 'Quickstart, core concepts and API reference for WDBX and the ABI Framework. Local-first by default.',
};

export default function DocsPage() {
  return (
    <main>
      <DocsInteractions />

      <section className="page-hero docs-hero">
        <div className="neural-host" data-neural="galaxy" data-glow="0.5" data-density="0.7" data-chain="0"></div>
        <div className="veil"></div>
        <div className="wrap">
          <Reveal><div className="eyebrow">Documentation · WDBX + ABI</div></Reveal>
          <Reveal as="h1" delay={70}>Build on <span className="grad-text">WDBX.</span></Reveal>
          <Reveal as="p" className="lede" delay={140}>
            From zero to verified vector search in five minutes. Everything below runs on your hardware — nothing phones home.
          </Reveal>
        </div>
      </section>

      <div className="docs-wrap">
        <aside className="docs-toc" aria-label="On this page">
          <div className="toc-title">On this page</div>
          <a href="#quickstart" className="on">Quickstart</a>
          <a href="#concepts">Core concepts</a>
          <a href="#search">Search API</a>
          <a href="#verify">Verify the chain</a>
          <a href="#deploy">Deployment</a>
        </aside>

        <div className="docs-main">

          <section className="docs-sec" id="quickstart">
            <h2>Quickstart</h2>
            <p>WDBX ships as a Zig library with a Swift 6 SDK for Apple platforms. Build from source, open a database, insert, search.</p>
            <div className="callout warn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <p>The API surface below is illustrative — the SDK is in private access. <a href="/contact" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>Request access →</a></p>
            </div>
            <div className="codeblock">
              <div className="cb-head"><span className="cb-lang">shell</span><button className="cb-copy" type="button">Copy</button></div>
              <pre>{`git clone git@mlai.internal:wdbx/wdbx.git
cd wdbx
zig build -Doptimize=ReleaseFast   # Zig 0.17-dev
zig build test                     # bench harness included`}</pre>
            </div>
            <div className="codeblock">
              <div className="cb-head"><span className="cb-lang">zig</span><button className="cb-copy" type="button">Copy</button></div>
              <pre>{`const wdbx = @import("wdbx");

var db = try wdbx.open(allocator, .{
    .path = "memory.wdbx",
    .dims = 768,
    .metric = .cosine,           // cosine for text, L2 for clustering
    .index = .{ .hnsw = .{ .m = 16, .ef_construction = 200 } },
});
defer db.close();

try db.insert(id, embedding, .{ .meta = payload });`}</pre>
            </div>
          </section>

          <section className="docs-sec" id="concepts">
            <h2>Core concepts</h2>
            <h3>HNSW index</h3>
            <p>Hierarchical Navigable Small World graphs give O(log n) approximate nearest-neighbor search. Two parameters matter: <b>M</b> (graph connectivity, default 16) and <b>ef</b> (search beam width, default 200). Raise <b>ef</b> for recall, lower it for latency.</p>
            <h3>MVCC snapshots</h3>
            <p>Writes create new versions; readers see a consistent snapshot from transaction start. Readers never block writers — inference-heavy read traffic and background ingestion never contend.</p>
            <h3>Hash-chained WAL</h3>
            <p>Every write-ahead-log block is sealed over the previous block&apos;s hash. The audit trail is immutable by construction — tamper with any block and verification fails from that point forward.</p>
            <div className="codeblock">
              <div className="cb-head"><span className="cb-lang">invariant</span><button className="cb-copy" type="button">Copy</button></div>
              <pre>{`hash(blockₙ) = SHA-256(dataₙ ⊕ hash(blockₙ₋₁))`}</pre>
            </div>
          </section>

          <section className="docs-sec" id="search">
            <h2>Search API</h2>
            <div className="codeblock">
              <div className="cb-head"><span className="cb-lang">swift</span><button className="cb-copy" type="button">Copy</button></div>
              <pre>{`let results = try await db.search(
    query: embedding,
    k: 10,
    ef: 200,                  // beam width override
    filter: .meta("lang", .equals("en"))
)
// 2.3ms p50 at 100K vectors — measured, single M-series node`}</pre>
            </div>
            <table className="api-table">
              <thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
              <tbody>
                <tr><td>query</td><td><b>[Float]</b></td><td>Query embedding. Must match the database&apos;s declared dimensionality.</td></tr>
                <tr><td>k</td><td><b>Int</b></td><td>Number of neighbors to return.</td></tr>
                <tr><td>ef</td><td><b>Int?</b></td><td>Search beam width. Defaults to the index&apos;s construction value.</td></tr>
                <tr><td>filter</td><td><b>Filter?</b></td><td>Metadata predicate applied during graph traversal, not after.</td></tr>
                <tr><td>snapshot</td><td><b>TxID?</b></td><td>Pin the search to a specific MVCC snapshot.</td></tr>
              </tbody>
            </table>
          </section>

          <section className="docs-sec" id="verify">
            <h2>Verify the chain</h2>
            <p>Verification replays the WAL and recomputes the hash chain. It runs incrementally — only blocks since the last verified checkpoint are re-hashed.</p>
            <div className="codeblock">
              <div className="cb-head"><span className="cb-lang">shell</span><button className="cb-copy" type="button">Copy</button></div>
              <pre>{`$ wdbx verify memory.wdbx
✓ 1,048,576 blocks verified
✓ chain head: 7f3a…c2e1
✓ no divergence`}</pre>
            </div>
            <div className="callout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <p>A failed verification names the first divergent block and refuses to serve reads past it unless explicitly overridden.</p>
            </div>
          </section>

          <section className="docs-sec" id="deploy">
            <h2>Deployment</h2>
            <p>WDBX runs wherever your data lives: embedded in an iOS / macOS app via the Swift SDK, as a library inside your service, or under the ABI Framework for orchestrated multi-persona workloads.</p>
            <table className="api-table">
              <thead><tr><th>Target</th><th>Acceleration</th><th>Notes</th></tr></thead>
              <tbody>
                <tr><td>Apple Silicon</td><td><b>Metal · Accelerate</b></td><td>App Store-ready; distance kernels on GPU via ABI.</td></tr>
                <tr><td>Linux x86 / ARM</td><td><b>CUDA · Vulkan</b></td><td>Server and edge deployments.</td></tr>
                <tr><td>Offline-first</td><td><b>CPU SIMD</b></td><td>No network dependency; verification fully local.</td></tr>
              </tbody>
            </table>
            <p style={{ marginTop: 20 }}><a className="btn-primary" href="/contact">Request access</a> <a className="btn-ghost" style={{ marginLeft: 10 }} href="/wdbx">WDBX overview →</a></p>
          </section>

        </div>
      </div>
    </main>
  );
}
