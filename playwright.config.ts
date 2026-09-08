import { defineConfig, devices } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

// Playwright reloads configuration in workers; inherit one run identity.
const runId = process.env.MLAI_E2E_RUN_ID || randomUUID();
if (!/^[a-zA-Z0-9-]+$/.test(runId)) throw new Error("Invalid MLAI_E2E_RUN_ID");
process.env.MLAI_E2E_RUN_ID = runId;
const dataDir = `.data-e2e/runs/${runId}`;
const tsconfigPath = `.tsconfig-e2e-${runId}.json`;
// Next adds generated type roots to its config. Keep that mutation out of Git.
if (!existsSync(tsconfigPath)) {
  writeFileSync(tsconfigPath, readFileSync("tsconfig.json"), { flag: "wx" });
}
process.env.MLAI_E2E_DATA_DIR = dataDir;
const crossBrowser = process.env.MLAI_E2E_CROSS_BROWSER === "1";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3101",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    ...(crossBrowser
      ? [
          {
            name: "firefox",
            testMatch: "**/public-cross-browser.spec.ts",
            use: { ...devices["Desktop Firefox"] },
          },
          {
            name: "webkit",
            testMatch: "**/public-cross-browser.spec.ts",
            use: { ...devices["Desktop Safari"] },
          },
        ]
      : []),
  ],
  webServer: {
    command: "bun run dev",
    url: "http://127.0.0.1:3101/api/v1/health",
    reuseExistingServer: false,
    timeout: 60000,
    env: {
      APP_URL: "http://127.0.0.1:3101",
      MLAI_DATA_DIR: dataDir,
      NEXT_DIST_DIR: `.next-e2e/runs/${runId}`,
      MLAI_NEXT_TSCONFIG: tsconfigPath,
      MLAI_LOCAL_MODEL_URL:
        process.env.MLAI_E2E_MODEL_URL || "http://127.0.0.1:8080/v1",
      MLAI_LOCAL_MODEL_ID: process.env.MLAI_E2E_MODEL_ID || "",
    },
  },
});
