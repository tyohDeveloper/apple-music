// Runs work inside one library's scope. app_current_library() returns the library
// only if the user is a member, so a wrong library id reads and writes nothing. A
// transaction config (isolation level, read only) applies from the first statement.
import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgTransactionConfig } from "drizzle-orm/pg-core";
import type { ScopedTransaction } from "./withUserScope.ts";

export type LibraryScope = { readonly userId: string; readonly libraryId: string };

export function withLibraryScope<T>(
  db: NodePgDatabase,
  scope: LibraryScope,
  work: (tx: ScopedTransaction) => Promise<T>,
  config?: PgTransactionConfig,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_id', ${scope.userId}, true),
      set_config('app.library_id', ${scope.libraryId}, true)`);
    return work(tx);
  }, config);
}
