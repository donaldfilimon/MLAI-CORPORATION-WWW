import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");

describe("production delivery trust contract", () => {
  it("binds Google OIDC to the ordinary deployment workflow and environment", () => {
    const iam = readFileSync(resolve(root, "infra/iam.tf"), "utf8");

    expect(iam).toMatch(
      /"attribute\.workflow_ref"\s*=\s*"assertion\.workflow_ref"/,
    );
    expect(iam).toContain(
      "assertion.workflow_ref == '${var.github_repository}/.github/workflows/deploy-cloudrun.yml@refs/heads/main'",
    );
    expect(iam).toContain("assertion.environment == 'production'");
    // GitHub emits this different claim only for reusable workflows. Quesar's
    // deploy file is a normal workflow, so trusting it would lock out every run.
    expect(iam).not.toContain("job_workflow_ref");
  });

  it("keeps production secrets behind a named GitHub environment", () => {
    const workflow = readFileSync(
      resolve(root, ".github/workflows/deploy-cloudrun.yml"),
      "utf8",
    );

    expect(workflow).toMatch(/\n\s+environment: production\n/);
    expect(workflow).toContain("id-token: write");
    expect(workflow).toContain("WORKOS_SSO_MFA_POLICY_VERIFIED");
    expect(workflow).toContain(
      "WORKOS_SSO_MFA_POLICY_VERIFIED must be explicitly true or false",
    );
  });
});
