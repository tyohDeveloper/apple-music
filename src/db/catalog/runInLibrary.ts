// Runs catalog work inside one library's scope (ADR-0003) and turns expected Postgres
// failures, including those raised at commit by deferred constraints, into CatalogRefusal.
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { withLibraryScope, type LibraryScope } from "../withLibraryScope.ts";
import type { ScopedTransaction } from "../withUserScope.ts";
import { refusalOf, type RefusalCode } from "./catalogRefusal.ts";

export async function runInLibrary<T>(
  db: NodePgDatabase,
  scope: LibraryScope,
  work: (tx: ScopedTransaction) => Promise<T>,
  foreignKey: RefusalCode = "not-found",
): Promise<T> {
  try {
    return await withLibraryScope(db, scope, work);
  } catch (error) {
    throw refusalOf(error, foreignKey) ?? error;
  }
}
