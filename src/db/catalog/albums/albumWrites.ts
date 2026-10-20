// Writes of albums, their credits and their intended track lists. The title is stored with
// collapsed whitespace and its match key; credits and tracks are replaced as whole lists
// (ADR-0009). Deleting an album takes its credits and tracks; its editions refuse it.
import { eq, sql } from "drizzle-orm";
import { album, albumCredit, albumTrack } from "../../schema/albumTables.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";
import { storedTitle } from "../storedTitle.ts";
import type { CreditFields } from "../recordings/recordingWrites.ts";

export type AlbumFields = {
  readonly title: string;
  readonly kind: string;
  readonly released: string | null;
  readonly label: string | null;
  readonly notes: string | null;
};
export type AlbumTrackFields = { readonly recordingId: string; readonly title: string | null; readonly label: string | null };

export async function createAlbum(tx: ScopedTransaction, libraryId: string, fields: AlbumFields): Promise<string> {
  const [created] = await tx.insert(album).values({ libraryId, ...fields, ...storedTitle(fields.title) }).returning({ id: album.id });
  if (created === undefined) throw new Error("insert into album returned no row");
  return created.id;
}

export async function updateAlbum(tx: ScopedTransaction, albumId: string, changes: Partial<AlbumFields>): Promise<boolean> {
  const title = changes.title === undefined ? {} : storedTitle(changes.title);
  const updated = await tx.update(album).set({ ...changes, ...title, updatedAt: sql`now()` }).where(eq(album.id, albumId)).returning({ id: album.id });
  return updated.length > 0;
}

export async function deleteAlbum(tx: ScopedTransaction, albumId: string): Promise<boolean> {
  const deleted = await tx.delete(album).where(eq(album.id, albumId)).returning({ id: album.id });
  return deleted.length > 0;
}

export async function replaceAlbumCredits(tx: ScopedTransaction, libraryId: string, albumId: string, credits: readonly CreditFields[]): Promise<boolean> {
  if (!(await updateAlbum(tx, albumId, {}))) return false;
  await tx.delete(albumCredit).where(eq(albumCredit.albumId, albumId));
  if (credits.length > 0) await tx.insert(albumCredit).values(credits.map((credit, position) => ({ libraryId, albumId, position, ...credit })));
  return true;
}

export async function replaceAlbumTracks(tx: ScopedTransaction, libraryId: string, albumId: string, discs: readonly (readonly AlbumTrackFields[])[]): Promise<boolean> {
  if (!(await updateAlbum(tx, albumId, {}))) return false;
  await tx.delete(albumTrack).where(eq(albumTrack.albumId, albumId));
  const rows = discs.flatMap((tracks, discIndex) => tracks.map((track, position) => ({ libraryId, albumId, discIndex, position, ...track })));
  if (rows.length > 0) await tx.insert(albumTrack).values(rows);
  return true;
}
