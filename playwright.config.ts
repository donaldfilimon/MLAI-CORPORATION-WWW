import { defineConfig, devices } from "@playwright/test";
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
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "bun run dev",
    url: "http://127.0.0.1:3101/api/v1/health",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
    env: {
      APP_URL: "http://127.0.0.1:3101",
      MLAI_DATA_DIR: ".data-e2e",
      NEXT_DIST_DIR: ".next-e2e",
      MLAI_LOCAL_MODEL_URL:
        process.env.MLAI_E2E_MODEL_URL || "http://127.0.0.1:8080/v1",
      MLAI_LOCAL_MODEL_ID: process.env.MLAI_E2E_MODEL_ID || "",
    },
  },
});
