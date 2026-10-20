// Every album of the scoped library for its export, in creation order, with its credits,
// intended track list, genres, identifiers and editions; each edition with its tracks and
// identifiers, also in creation order.
import { sql } from "drizzle-orm";
import type { ExportAlbum } from "../../../contracts/export/exportAlbumSchema.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";
import { albumCredits } from "../credits/creditQueries.ts";
import { albumGenres } from "../genres/genreAssignments.ts";
import { albumExternalIds, editionExternalIds } from "../identifiers/externalIds.ts";
import { creditsJson, externalIdsJson, genreIdsJson, instantText } from "./exportFragments.ts";

const albumTracksJson = sql`coalesce((select json_agg(json_build_object('discIndex', t.disc_index, 'position', t.position,
    'recordingId', t.recording_id, 'title', t.title, 'label', t.label) order by t.disc_index, t.position)
  from album_track t where t.library_id = a.library_id and t.album_id = a.id), '[]'::json)`;

const editionTracksJson = sql`coalesce((select json_agg(json_build_object('discIndex', t.disc_index, 'position', t.position,
    'title', t.title, 'recordingId', t.recording_id, 'inclusion', t.inclusion) order by t.disc_index, t.position)
  from edition_track t where t.library_id = e.library_id and t.edition_id = e.id), '[]'::json)`;

const editionsJson = sql`coalesce((select json_agg(json_build_object('id', e.id, 'title', e.title, 'kind', e.kind,
    'released', e.released, 'notes', e.notes, 'tracks', ${editionTracksJson}, 'externalIds', ${externalIdsJson(editionExternalIds, "e")},
    'createdAt', ${instantText(sql`e.created_at`)}, 'updatedAt', ${instantText(sql`e.updated_at`)}) order by e.created_at, e.id)
  from edition e where e.library_id = a.library_id and e.album_id = a.id), '[]'::json)`;

export async function albumExportsOf(tx: ScopedTransaction): Promise<ExportAlbum[]> {
  const { rows } = await tx.execute<ExportAlbum>(sql`
    select a.id, a.title, a.kind, a.released, a.label, a.notes, ${creditsJson(albumCredits, "a")} as credits,
      ${albumTracksJson} as tracks, ${genreIdsJson(albumGenres, "a")} as "genreIds",
      ${externalIdsJson(albumExternalIds, "a")} as "externalIds", ${editionsJson} as editions,
      ${instantText(sql`a.created_at`)} as "createdAt", ${instantText(sql`a.updated_at`)} as "updatedAt"
    from album a order by a.created_at, a.id`);
  return rows;
}
