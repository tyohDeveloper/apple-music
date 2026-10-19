// Shared fixtures for integration tests: configuration, pools, users and a server.
import pg from "pg";
import { createDatabasePools, type DatabasePools } from "../../../src/db/createDatabasePools.ts";
import { buildServer } from "../../../src/server/app/buildServer.ts";
import { createOwnerAccount } from "../../../src/server/auth/createOwnerAccount.ts";
import { readServerConfig } from "../../../src/server/config/readServerConfig.ts";

export const testConfig = () => readServerConfig(process.env);

export function openTestPools(): DatabasePools {
  return createDatabasePools(testConfig().database);
}

let userCounter = 0;

export async function createTestUser(pools: DatabasePools, label: string): Promise<{ id: string; email: string; password: string }> {
  userCounter += 1;
  const email = `${label}-${process.pid}-${userCounter}-${Date.now()}@example.test`;
  const password = "integration-password";
  const id = await createOwnerAccount(testConfig(), pools.auth, { email, name: label, password });
  return { id, email, password };
}

export function buildTestServer(pools: DatabasePools) {
  return buildServer({ config: testConfig(), pools, serveClientAssets: false, logRequests: false });
}

export async function queryAsRole<T extends pg.QueryResultRow>(url: string, text: string, values: unknown[] = []) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    return await client.query<T>(text, values);
  } finally {
    await client.end();
  }
}
