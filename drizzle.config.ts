// Drizzle Kit configuration (BUILD). Migrations are timestamp-prefixed and live in drizzle/.
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/*.ts",
  out: "./drizzle",
  migrations: { prefix: "timestamp", schema: "drizzle", table: "__drizzle_migrations" },
  dbCredentials: { url: process.env["DATABASE_ADMIN_URL"] ?? "" },
});
