// Server entry: read configuration, apply migrations, mark sync runs a stopped server left
// running as interrupted, then listen. Shuts down cleanly on SIGTERM and SIGINT.
import { interruptRunningSyncRuns } from "../db/apple-music/interruptRunningSyncRuns.ts";
import { createDatabasePools } from "../db/createDatabasePools.ts";
import { migrateDatabase } from "../db/migrateDatabase.ts";
import { buildServer } from "./app/buildServer.ts";
import { readServerConfig } from "./config/readServerConfig.ts";

async function start(): Promise<void> {
  const config = readServerConfig();
  await migrateDatabase(config.database.adminUrl, config.migrationsFolder);
  await interruptRunningSyncRuns(config.database.adminUrl);
  const pools = createDatabasePools(config.database);
  const app = await buildServer({ config, pools, serveClientAssets: true, logRequests: true });
  const stop = async (): Promise<void> => {
    await app.close();
    await pools.close();
  };
  process.once("SIGTERM", () => void stop());
  process.once("SIGINT", () => void stop());
  await app.listen({ host: config.host, port: config.port });
}

await start();
