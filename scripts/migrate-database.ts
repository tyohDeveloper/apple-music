// Applies pending migrations without starting the server.
import { migrateDatabase } from "../src/db/migrateDatabase.ts";
import { readServerConfig } from "../src/server/config/readServerConfig.ts";

const config = readServerConfig();
await migrateDatabase(config.database.adminUrl, config.migrationsFolder);
console.log("Migrations applied.");
