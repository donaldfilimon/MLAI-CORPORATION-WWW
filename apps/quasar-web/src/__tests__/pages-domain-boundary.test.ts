import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const APP_ROOT = resolve(__dirname, "../..");
const SITE_DIR = resolve(APP_ROOT, "site");
const DEPLOY_RUNBOOK = resolve(APP_ROOT, "docs/deploy-cloud-run.md");

describe("GitHub Pages companion domain boundary", () => {
  it("does not claim the canonical production hostname with a CNAME file", () => {
    expect(
      existsSync(resolve(SITE_DIR, "CNAME")),
      "site/CNAME would bind the Pages companion to a custom hostname; quesar.cloud belongs to the Cloudflare -> Google load balancer -> Cloud Run production path",
    ).toBe(false);
  });

  it("documents the production DNS boundary next to the cutover procedure", () => {
    const runbook = readFileSync(DEPLOY_RUNBOOK, "utf8");

    expect(runbook).toContain("## GitHub Pages companion domain boundary");
    expect(runbook).toContain("Do not point `quesar.cloud` or `www.quesar.cloud` at GitHub Pages");
    expect(runbook).toContain("Hostinger remains the registrar");
  });
});
