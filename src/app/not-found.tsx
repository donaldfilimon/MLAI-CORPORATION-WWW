import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <p className="eyeline">404</p>
      <h1>This page isn’t here.</h1>
      <p>The link may have changed. Your workspace is still within reach.</p>
      <div className="button-row">
        <Link className="button primary" href="/">
          Return home
        </Link>
        <Link className="button secondary" href="/app">
          Open workspace
        </Link>
      </div>
    </main>
  );
}
