// Unit tests (including the standards checker's planted-violation controls) run in Node
// without a database; integration tests run serially against the
// test database named in .env.test (or the CI environment).
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const testEnvironment = loadEnv("test", process.cwd(), "");

export default defineConfig({
  test: {
    projects: [
      { test: { name: "unit", include: ["tests/unit/**/*.test.ts", "tests/standards/**/*.test.ts"], environment: "node" } },
      {
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          environment: "node",
          env: testEnvironment,
          fileParallelism: false,
          globalSetup: ["tests/integration/support/prepareTestDatabase.ts"],
          testTimeout: 30_000,
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
