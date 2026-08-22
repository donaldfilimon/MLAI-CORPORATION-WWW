"use client";

/**
 * Global error boundary — the last-resort catch when `app/layout.tsx` itself
 * fails. It must render its own <html>/<body> and cannot rely on the global
 * stylesheet having loaded, so everything here is inline-styled with the raw
 * brand tokens (ink #05070d canvas, cyan #22d3ee primary).
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05070d",
          color: "#e6e9ef",
          fontFamily:
            "Geist, 'Geist Variable', system-ui, -apple-system, 'Segoe UI', sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <p
            style={{
              margin: 0,
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#22d3ee",
              fontWeight: 700,
            }}
          >
            Fatal — application shell failed
          </p>
          <h1
            style={{
              margin: "1rem 0 0",
              fontFamily: "Spectral, Georgia, serif",
              fontSize: "2.25rem",
              lineHeight: 1.15,
              color: "#ffffff",
              fontWeight: 700,
            }}
          >
            MLAI hit an unrecoverable error.
          </h1>
          <p style={{ margin: "1.25rem 0 0", color: "#98a2b0", lineHeight: 1.6 }}>
            The application shell could not render. Reloading usually resolves
            this; if it persists, the incident is on our side.
            {error.digest ? (
              <span
                style={{
                  display: "block",
                  marginTop: "0.75rem",
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontSize: 12,
                  color: "#6b7484",
                }}
              >
                Reference: {error.digest}
              </span>
            ) : null}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.6rem 1.4rem",
              borderRadius: 999,
              border: "1px solid rgba(34,211,238,0.4)",
              background: "transparent",
              color: "#22d3ee",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
