import { describe, expect, it } from "vitest";
import { validSchedulerClaims } from "@/lib/server/scheduler-auth";

describe("validSchedulerClaims", () => {
  const expected = "quesar-scheduler@example.iam.gserviceaccount.com";

  it("requires the exact verified service-account email", () => {
    expect(validSchedulerClaims({ email: expected, email_verified: true }, expected)).toBe(true);
    expect(validSchedulerClaims({ email: expected, email_verified: false }, expected)).toBe(false);
    expect(validSchedulerClaims({ email: "other@example.iam.gserviceaccount.com", email_verified: true }, expected)).toBe(false);
  });

  it("fails closed without an expected service account", () => {
    expect(validSchedulerClaims({ email: expected, email_verified: true }, "")).toBe(false);
  });
});
