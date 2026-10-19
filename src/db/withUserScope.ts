// Every application-role query runs in a transaction that names the signed-in user;
// row-level security reads the setting (ADR-0003).
import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export type ScopedTransaction = Parameters<Parameters<NodePgDatabase["transaction"]>[0]>[0];

export function withUserScope<T>(
  db: NodePgDatabase,
  userId: string,
  work: (tx: ScopedTransaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_id', ${userId}, true)`);
    return work(tx);
  });
}
