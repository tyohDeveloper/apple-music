// Applies pending migrations from drizzle/ with the owner role, before the server
// accepts traffic (hosted-Postgres profile).
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

export async function migrateDatabase(adminUrl: string, migrationsFolder: string): Promise<void> {
  const pool = new pg.Pool({ connectionString: adminUrl, max: 1, application_name: "apple-music-migrate" });
  try {
    await migrate(drizzle(pool), {
      migrationsFolder,
      migrationsSchema: "drizzle",
      migrationsTable: "__drizzle_migrations",
    });
  } finally {
    await pool.end();
  }
}
