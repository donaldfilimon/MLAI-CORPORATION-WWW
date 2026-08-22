import { describe, it, expect, vi, afterEach } from "vitest";
import { optedOut } from "../lib/telemetry";
import { normalizeTelemetryPath } from "../lib/server/telemetry-path";

afterEach(() => vi.unstubAllGlobals());

describe("telemetry optedOut — privacy gate", () => {
  it("opts out when navigator is unavailable (SSR)", () => {
    vi.stubGlobal("navigator", undefined);
    expect(optedOut()).toBe(true);
  });

  it("honors Do Not Track in both '1' and 'yes' forms", () => {
    vi.stubGlobal("navigator", { doNotTrack: "1" });
    expect(optedOut()).toBe(true);
    vi.stubGlobal("navigator", { doNotTrack: "yes" }); // older Firefox/Safari
    expect(optedOut()).toBe(true);
  });

  it("honors Global Privacy Control", () => {
    vi.stubGlobal("navigator", { doNotTrack: "0", globalPrivacyControl: true });
    expect(optedOut()).toBe(true);
  });

  it("allows tracking when no opt-out signal is present", () => {
    vi.stubGlobal("navigator", { doNotTrack: "unspecified" });
    expect(optedOut()).toBe(false);
  });
});

/**
 * The `telemetry_events` contract is "allowlisted event + pathname + timestamp,
 * no identifiers". `path` arrives from an unauthenticated body, so anything the
 * validator lets through is a string an anonymous caller chose. These cases pin
 * the boundary: real routes in, everything else flattened to "".
 */
describe("normalizeTelemetryPath — keeps the telemetry table identifier-free", () => {
  it("passes a known static route through unchanged", () => {
    expect(normalizeTelemetryPath("/")).toBe("/");
    expect(normalizeTelemetryPath("/about")).toBe("/about");
    expect(normalizeTelemetryPath("/showcase/film")).toBe("/showcase/film");
    // noindex routes are still real routes — the sitemap filters them, this does not.
    expect(normalizeTelemetryPath("/console")).toBe("/console");
  });

  it("passes each dynamic-slug family through", () => {
    expect(normalizeTelemetryPath("/blog/wdbx-v2-release")).toBe("/blog/wdbx-v2-release");
    expect(normalizeTelemetryPath("/research/neural-backtracking")).toBe(
      "/research/neural-backtracking",
    );
    expect(normalizeTelemetryPath("/team/donald-filimon")).toBe("/team/donald-filimon");
    expect(normalizeTelemetryPath("/products/abi")).toBe("/products/abi");
    expect(normalizeTelemetryPath("/blog/zig-016-migration")).toBe("/blog/zig-016-migration");
  });

  it("drops an identifier smuggled in as a path — the defect this closes", () => {
    expect(normalizeTelemetryPath("/u/victim@example.com")).toBe("");
    expect(normalizeTelemetryPath("/blog/victim@example.com")).toBe("");
    expect(normalizeTelemetryPath("/team/user 12345 said something")).toBe("");
  });

  it("discards a query or fragment and keeps only the pathname it qualifies", () => {
    // The tail is dropped, not stored — so the pageview survives and the
    // identifier in it does not.
    expect(normalizeTelemetryPath("/about?utm_source=x&email=a@b.co")).toBe("/about");
    expect(normalizeTelemetryPath("/about#section")).toBe("/about");
    // Trimming is not a way in: what remains still has to be a known route.
    expect(normalizeTelemetryPath("/u/victim?token=abc")).toBe("");
  });

  it("drops an over-long path instead of truncating it", () => {
    // The old code sliced to 128 chars and stored the prefix; a prefix of an
    // attacker-chosen string is still attacker-chosen data.
    expect(normalizeTelemetryPath(`/blog/${"a".repeat(200)}`)).toBe("");
  });

  it("drops anything that is not a route-shaped string", () => {
    expect(normalizeTelemetryPath("not-a-route")).toBe("");
    expect(normalizeTelemetryPath("/nope")).toBe("");
    expect(normalizeTelemetryPath("https://evil.test/about")).toBe("");
    expect(normalizeTelemetryPath("")).toBe("");
    expect(normalizeTelemetryPath(undefined)).toBe("");
    expect(normalizeTelemetryPath(null)).toBe("");
    expect(normalizeTelemetryPath(42)).toBe("");
    expect(normalizeTelemetryPath({ toString: () => "/about" })).toBe("");
  });

  it("does not treat inherited Object properties as known routes", () => {
    // A plain-object allowlist checked with `in` would accept these.
    expect(normalizeTelemetryPath("constructor")).toBe("");
    expect(normalizeTelemetryPath("__proto__")).toBe("");
    expect(normalizeTelemetryPath("toString")).toBe("");
  });

  it("tolerates a trailing slash on an otherwise real route", () => {
    expect(normalizeTelemetryPath("/about/")).toBe("/about");
    expect(normalizeTelemetryPath("/blog/wdbx-v2-release/")).toBe("/blog/wdbx-v2-release");
  });

  it("rejects a deeper path under a dynamic family", () => {
    // Exactly one slug segment — no place to append free text.
    expect(normalizeTelemetryPath("/blog/wdbx-v2-release/extra")).toBe("");
  });
});
