// Reads of editions: the editions of one album, and one edition with its album and its track
// list, each track with its recording when known.
import { and, asc, eq, sql } from "drizzle-orm";
import { album } from "../../schema/albumTables.ts";
import { edition, editionTrack } from "../../schema/editionTables.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";
import { recordingReferencesOf, type RecordingReference } from "../recordings/recordingQueries.ts";

export type EditionSummary = { readonly id: string; readonly title: string; readonly kind: string; readonly released: string | null; readonly trackCount: number };
type EditionTrackRow = {
  readonly discIndex: number;
  readonly position: number;
  readonly title: string;
  readonly inclusion: string;
  readonly recording: RecordingReference | null;
};
export type EditionDetail = Omit<EditionSummary, "trackCount"> & {
  readonly album: { readonly id: string; readonly title: string };
  readonly notes: string | null;
  readonly tracks: EditionTrackRow[];
};

const trackCount = sql<number>`(select count(*)::int from edition_track t where t.library_id = ${edition.libraryId} and t.edition_id = ${edition.id})`;

export async function editionsOfAlbum(tx: ScopedTransaction, albumId: string): Promise<EditionSummary[]> {
  const { id, title, kind, released } = edition;
  return tx.select({ id, title, kind, released, trackCount }).from(edition).where(eq(edition.albumId, albumId)).orderBy(asc(released), asc(title), asc(id));
}

async function editionTracksOf(tx: ScopedTransaction, editionId: string): Promise<EditionTrackRow[]> {
  const { discIndex, position, title, inclusion, recordingId } = editionTrack;
  const rows = await tx.select({ discIndex, position, title, inclusion, recordingId }).from(editionTrack).where(eq(editionTrack.editionId, editionId)).orderBy(asc(discIndex), asc(position));
  const recordings = await recordingReferencesOf(tx, [...new Set(rows.flatMap((row) => (row.recordingId === null ? [] : [row.recordingId])))]);
  return rows.map(({ recordingId: id, ...track }) => ({ ...track, recording: id === null ? null : (recordings.get(id) ?? null) }));
}

export async function getEditionDetail(tx: ScopedTransaction, editionId: string): Promise<EditionDetail | null> {
  const { id, title, kind, released, notes } = edition;
  const [row] = await tx
    .select({ id, title, kind, released, notes, albumId: album.id, albumTitle: album.title })
    .from(edition)
    .innerJoin(album, and(eq(album.libraryId, edition.libraryId), eq(album.id, edition.albumId)))
    .where(eq(id, editionId));
  if (row === undefined) return null;
  const { albumId, albumTitle, ...fields } = row;
  return { ...fields, album: { id: albumId, title: albumTitle }, tracks: await editionTracksOf(tx, editionId) };
}
