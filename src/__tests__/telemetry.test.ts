import { describe, it, expect, vi, afterEach } from "vitest";
import { optedOut } from "../lib/telemetry";

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
