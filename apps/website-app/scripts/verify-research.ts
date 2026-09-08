import {
  readResearchSnapshot,
  validateResearchSnapshot,
  verifySiteParity,
  sha256,
} from "./research-validation";
import { gitDiffHash } from "./git-diff-hash";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";

try {
  const { values } = parseArgs({
    options: {
      "site-root": { type: "string" },
      output: { type: "string" },
    },
  });
  const input = readResearchSnapshot();
  const result = {
    status: "passed",
    verifiedAt: new Date().toISOString(),
    applicationRevision: execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim(),
    applicationDirty:
      execFileSync("git", ["status", "--porcelain", "--", "."], {
        encoding: "utf8",
      }).trim().length > 0,
    ...validateResearchSnapshot(input),
    researchContentSha256: sha256(JSON.stringify(input.research)),
    validatorSha256: sha256(readFileSync("scripts/research-validation.ts")),
    verifierSha256: sha256(readFileSync("scripts/verify-research.ts")),
    applicationDiffSha256: await gitDiffHash([
      "src",
      "packages",
      "scripts",
      "tests",
      "package.json",
      "bun.lock",
      "playwright.config.ts",
    ]),
    implementationDataSha256: sha256(input.studyBytes),
    sourceParity: values["site-root"]
      ? verifySiteParity(values["site-root"])
      : "not requested",
  };
  const output = `${JSON.stringify(result, null, 2)}\n`;
  if (values.output) {
    const path = resolve(values.output);
    if (
      !path.startsWith(`${resolve("docs/verification")}/`) &&
      !path.startsWith(`${resolve(".data")}/`)
    ) {
      throw new Error(
        "Receipt output must be under docs/verification or .data",
      );
    }
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, output, { flag: "wx" });
  }
  console.log(output.trimEnd());
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Research validation failed",
  );
  process.exitCode = 1;
}
