// Runs catalog work inside one library's scope (ADR-0003) and turns expected Postgres
// failures, including those raised at commit by deferred constraints, into CatalogRefusal.
// Writes first require the owner or editor role: row-level security alone would let an
// update or delete by a viewer match no rows and read as "not found".
import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { withLibraryScope, type LibraryScope } from "../withLibraryScope.ts";
import type { ScopedTransaction } from "../withUserScope.ts";
import { CatalogRefusal, refusalOf, type RefusalCode } from "./catalogRefusal.ts";

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

export function writeInLibrary<T>(
  db: NodePgDatabase,
  scope: LibraryScope,
  work: (tx: ScopedTransaction) => Promise<T>,
  foreignKey: RefusalCode = "not-found",
): Promise<T> {
  return runInLibrary(db, scope, async (tx) => {
    const { rows } = await tx.execute<{ editable: string | null }>(sql`select app_current_editable_library() as editable`);
    if (rows[0]?.editable === null || rows[0]?.editable === undefined) throw new CatalogRefusal("forbidden");
    return work(tx);
  }, foreignKey);
}
