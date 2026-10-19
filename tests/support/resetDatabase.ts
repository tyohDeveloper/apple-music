// Rebuilds a test database from the migrations: drops every schema the application
// owns, recreates the login roles and applies drizzle/ in order.
import pg from "pg";
import { bootstrapDatabaseRoles, type RoleCredential } from "../../src/db/bootstrapDatabaseRoles.ts";
import { migrateDatabase } from "../../src/db/migrateDatabase.ts";

function credential(variable: string): RoleCredential {
  const url = new URL(process.env[variable] ?? "");
  return { name: decodeURIComponent(url.username), password: decodeURIComponent(url.password) };
}

async function dropSchemas(adminUrl: string): Promise<void> {
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  try {
    await client.query("DROP SCHEMA IF EXISTS drizzle CASCADE; DROP SCHEMA IF EXISTS auth CASCADE;");
    await client.query("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");
  } finally {
    await client.end();
  }
}

export async function resetDatabase(): Promise<void> {
  const adminUrl = process.env["DATABASE_ADMIN_URL"] ?? "";
  await dropSchemas(adminUrl);
  await bootstrapDatabaseRoles(adminUrl, [credential("DATABASE_URL"), credential("DATABASE_AUTH_URL")]);
  await migrateDatabase(adminUrl, "drizzle");
}
