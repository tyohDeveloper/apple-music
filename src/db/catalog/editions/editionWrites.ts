// Writes of editions and their track lists. An edition can move to another album of the
// library; its tracks are replaced as a whole list (ADR-0009) and go with it when deleted.
import { eq, sql } from "drizzle-orm";
import { collapseWhitespace } from "../../../names/collapseWhitespace.ts";
import { edition, editionTrack } from "../../schema/editionTables.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";

export type EditionFields = {
  readonly albumId: string;
  readonly title: string;
  readonly kind: string;
  readonly released: string | null;
  readonly notes: string | null;
};
export type EditionTrackFields = { readonly title: string; readonly recordingId: string | null; readonly inclusion: string };

export async function createEdition(tx: ScopedTransaction, libraryId: string, fields: EditionFields): Promise<string> {
  const [created] = await tx.insert(edition).values({ libraryId, ...fields, title: collapseWhitespace(fields.title) }).returning({ id: edition.id });
  if (created === undefined) throw new Error("insert into edition returned no row");
  return created.id;
}

export async function updateEdition(tx: ScopedTransaction, editionId: string, changes: Partial<EditionFields>): Promise<boolean> {
  const title = changes.title === undefined ? {} : { title: collapseWhitespace(changes.title) };
  const updated = await tx.update(edition).set({ ...changes, ...title, updatedAt: sql`now()` }).where(eq(edition.id, editionId)).returning({ id: edition.id });
  return updated.length > 0;
}

export async function deleteEdition(tx: ScopedTransaction, editionId: string): Promise<boolean> {
  const deleted = await tx.delete(edition).where(eq(edition.id, editionId)).returning({ id: edition.id });
  return deleted.length > 0;
}

export async function replaceEditionTracks(tx: ScopedTransaction, libraryId: string, editionId: string, discs: readonly (readonly EditionTrackFields[])[]): Promise<boolean> {
  if (!(await updateEdition(tx, editionId, {}))) return false;
  await tx.delete(editionTrack).where(eq(editionTrack.editionId, editionId));
  const rows = discs.flatMap((tracks, discIndex) => tracks.map((track, position) => ({ libraryId, editionId, discIndex, position, ...track })));
  if (rows.length > 0) await tx.insert(editionTrack).values(rows);
  return true;
}
