// End-to-end tests against the built server (§8.3). Run `npm run bundle` first.
import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

if (existsSync(".env.test")) process.loadEnvFile(".env.test");
const baseURL = process.env["BETTER_AUTH_URL"] ?? "http://127.0.0.1:5175";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npx tsx tests/e2e/support/launchServer.ts",
    url: `${baseURL}/health`,
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
