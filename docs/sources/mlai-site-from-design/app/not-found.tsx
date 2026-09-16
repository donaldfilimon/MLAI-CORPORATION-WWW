import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <section className="page-hero">
        <div className="veil"></div>
        <div className="wrap">
          <div className="eyebrow">404</div>
          <h1>This page <span className="grad-text">never phoned home.</span></h1>
          <p className="lede">It doesn&apos;t exist here either.</p>
          <div className="hero-actions">
            <Link className="btn-primary" href="/">Back to the homepage</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
