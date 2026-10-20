// The intended track list of an album, disc by disc, each track with the recording it plays.
import { asc, eq } from "drizzle-orm";
import { albumTrack } from "../../schema/albumTables.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";
import { recordingReferencesOf, type RecordingReference } from "../recordings/recordingQueries.ts";

export type AlbumTrackRow = {
  readonly discIndex: number;
  readonly position: number;
  readonly title: string | null;
  readonly label: string | null;
  readonly recording: RecordingReference;
};

export async function albumTracksOf(tx: ScopedTransaction, albumId: string): Promise<AlbumTrackRow[]> {
  const { discIndex, position, title, label, recordingId } = albumTrack;
  const rows = await tx.select({ discIndex, position, title, label, recordingId }).from(albumTrack).where(eq(albumTrack.albumId, albumId)).orderBy(asc(discIndex), asc(position));
  const recordings = await recordingReferencesOf(tx, [...new Set(rows.map((row) => row.recordingId))]);
  return rows.flatMap(({ recordingId: id, ...track }) => {
    const recording = recordings.get(id);
    return recording === undefined ? [] : [{ ...track, recording }];
  });
}
