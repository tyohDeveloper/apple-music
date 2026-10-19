// Runs work inside one library's scope. app_current_library() returns the library
// only if the user is a member, so a wrong library id reads and writes nothing.
import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { ScopedTransaction } from "./withUserScope.ts";

export type LibraryScope = { readonly userId: string; readonly libraryId: string };

export function withLibraryScope<T>(
  db: NodePgDatabase,
  scope: LibraryScope,
  work: (tx: ScopedTransaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_id', ${scope.userId}, true),
      set_config('app.library_id', ${scope.libraryId}, true)`);
    return work(tx);
  });
}
