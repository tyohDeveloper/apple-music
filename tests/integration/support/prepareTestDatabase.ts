// Vitest global setup: every integration run starts from the schema a fresh deployment has.
import { existsSync } from "node:fs";
import { resetDatabase } from "../../support/resetDatabase.ts";

export default async function prepareTestDatabase(): Promise<void> {
  if (existsSync(".env.test")) process.loadEnvFile(".env.test");
  await resetDatabase();
}
