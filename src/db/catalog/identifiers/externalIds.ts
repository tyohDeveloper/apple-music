// The external identifiers of a performer, album, edition or recording (docs/design/
// catalog.md, External identifiers): read in namespace order, and replaced as a whole list
// of values already normalized and checked against their formats.
import { sql } from "drizzle-orm";
import type { ScopedTransaction } from "../../withUserScope.ts";

type Owner = "performer" | "album" | "edition" | "recording";
export type ExternalIdSource = { readonly ownerTable: Owner; readonly table: `${Owner}_external_id`; readonly owner: `${Owner}_id` };
export const performerExternalIds: ExternalIdSource = { ownerTable: "performer", table: "performer_external_id", owner: "performer_id" };
export const albumExternalIds: ExternalIdSource = { ownerTable: "album", table: "album_external_id", owner: "album_id" };
export const editionExternalIds: ExternalIdSource = { ownerTable: "edition", table: "edition_external_id", owner: "edition_id" };
export const recordingExternalIds: ExternalIdSource = { ownerTable: "recording", table: "recording_external_id", owner: "recording_id" };

export type ExternalIdRow = { readonly namespace: string; readonly value: string };

export async function externalIdsOf(tx: ScopedTransaction, source: ExternalIdSource, ownerId: string): Promise<ExternalIdRow[]> {
  const { rows } = await tx.execute<ExternalIdRow>(
    sql`select namespace, value from ${sql.identifier(source.table)} where ${sql.identifier(source.owner)} = ${ownerId} order by namespace, value`,
  );
  return rows;
}

// False when the performer, album, edition or recording is not in the library.
export async function replaceExternalIds(tx: ScopedTransaction, source: ExternalIdSource, libraryId: string, ownerId: string, ids: readonly ExternalIdRow[]): Promise<boolean> {
  const { rows } = await tx.execute(sql`update ${sql.identifier(source.ownerTable)} set updated_at = now() where id = ${ownerId} returning id`);
  if (rows.length === 0) return false;
  const [table, owner] = [sql.identifier(source.table), sql.identifier(source.owner)];
  await tx.execute(sql`delete from ${table} where ${owner} = ${ownerId}`);
  if (ids.length === 0) return true;
  const [namespaces, values] = [ids.map((id) => id.namespace), ids.map((id) => id.value)];
  await tx.execute(sql`insert into ${table} (library_id, ${owner}, namespace, value)
    select ${libraryId}::uuid, ${ownerId}::uuid, given.namespace, given.value
    from unnest(${sql.param(namespaces)}::text[], ${sql.param(values)}::text[]) as given(namespace, value)`);
  return true;
}
