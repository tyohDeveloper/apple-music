// The whole curated catalog of one library as one document (docs/design/catalog.md, Export),
// read in a single repeatable-read, read-only transaction so that it is one snapshot, taken
// at exportedAt. Null when the user is not a member of the library.
import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { LibraryExport } from "../../../contracts/export/libraryExportSchema.ts";
import { withLibraryScope, type LibraryScope } from "../../withLibraryScope.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";
import { albumExportsOf } from "./albumExports.ts";
import { instantText } from "./exportFragments.ts";
import { genreExportsOf } from "./genreExports.ts";
import { performerExportsOf, performerRelationExportsOf } from "./performerExports.ts";
import { recordingExportsOf } from "./recordingExports.ts";

export type ExportWriter = LibraryExport["application"];
type ExportHead = { readonly exportedAt: string; readonly library: LibraryExport["library"] };
type HeadRow = LibraryExport["library"] & { readonly exportedAt: string };

const snapshot = { isolationLevel: "repeatable read", accessMode: "read only" } as const;

async function exportHeadOf(tx: ScopedTransaction, libraryId: string): Promise<ExportHead | null> {
  const { rows } = await tx.execute<HeadRow>(sql`
    select ${instantText(sql`now()`)} as "exportedAt", l.id, l.label, l.storefront,
      ${instantText(sql`l.created_at`)} as "createdAt", ${instantText(sql`l.updated_at`)} as "updatedAt"
    from library l where l.id = ${libraryId}`);
  const row = rows[0];
  if (row === undefined) return null;
  const { id, label, storefront, createdAt, updatedAt } = row;
  return { exportedAt: row.exportedAt, library: { id, label, storefront, createdAt, updatedAt } };
}

async function documentOf(tx: ScopedTransaction, head: ExportHead, application: ExportWriter): Promise<LibraryExport> {
  const [genres, performers, performerRelations] = [await genreExportsOf(tx), await performerExportsOf(tx), await performerRelationExportsOf(tx)];
  const [recordings, albums] = [await recordingExportsOf(tx), await albumExportsOf(tx)];
  const format = "apple-music-library-export";
  return { format, formatVersion: 1, exportedAt: head.exportedAt, application, library: head.library, genres, performers, performerRelations, recordings, albums };
}

export function libraryExportOf(db: NodePgDatabase, scope: LibraryScope, application: ExportWriter): Promise<LibraryExport | null> {
  return withLibraryScope(db, scope, async (tx) => {
    const head = await exportHeadOf(tx, scope.libraryId);
    return head === null ? null : documentOf(tx, head, application);
  }, snapshot);
}
