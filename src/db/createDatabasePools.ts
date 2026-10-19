// Connection pools per database role (docs/ARCHITECTURE.md, Datastore). Statement and
// idle-in-transaction timeouts are set on every connection so no request can hold a
// transaction open indefinitely.
import pg from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";

export type DatabaseSettings = {
  readonly appUrl: string;
  readonly authUrl: string;
  readonly adminUrl: string;
  readonly poolMax: number;
  readonly statementTimeoutMs: number;
};

export type DatabasePools = {
  readonly app: NodePgDatabase;
  readonly auth: NodePgDatabase;
  readonly close: () => Promise<void>;
};

function openPool(connectionString: string, settings: DatabaseSettings, name: string): pg.Pool {
  return new pg.Pool({
    connectionString,
    max: settings.poolMax,
    statement_timeout: settings.statementTimeoutMs,
    idle_in_transaction_session_timeout: settings.statementTimeoutMs * 2,
    application_name: name,
  });
}

export function createDatabasePools(settings: DatabaseSettings): DatabasePools {
  const appPool = openPool(settings.appUrl, settings, "apple-music-app");
  const authPool = openPool(settings.authUrl, settings, "apple-music-auth");
  return {
    app: drizzle(appPool),
    auth: drizzle(authPool),
    close: async () => {
      await Promise.all([appPool.end(), authPool.end()]);
    },
  };
}
