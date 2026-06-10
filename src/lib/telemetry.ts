/**
 * Privacy-respecting, first-party telemetry.
 *
 * Design constraints (enforced server-side too, in server.ts /api/telemetry):
 * - Allowlisted event names only — no free-form payloads.
 * - No identifiers: no cookies, no user id, no fingerprinting; the server
 *   stores event + pathname + timestamp and nothing else.
 * - Honors Do Not Track / Global Privacy Control before any request is made.
 * - Fire-and-forget: a failed beacon must never affect the user-facing flow.
 */

export type TelemetryEvent =
  | "inquiry_open"
  | "inquiry_submit"
  | "inquiry_success"
  | "inquiry_close";

function optedOut(): boolean {
  if (typeof navigator === "undefined") return true;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true;
}

export function track(event: TelemetryEvent): void {
  if (optedOut()) return;
  try {
    const payload = JSON.stringify({ event, path: window.location.pathname });
    // sendBeacon survives page unloads and never blocks; fall back to a
    // keepalive fetch where beacons are unavailable.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/telemetry",
        new Blob([payload], { type: "application/json" }),
      );
    } else {
      void fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Telemetry is best-effort by design.
  }
}
