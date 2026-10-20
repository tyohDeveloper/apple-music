// Reads of albums (DOMAIN-MODEL.md): search by title or by any name of a performer credited
// on the album or on one of its intended tracks, optionally only the albums crediting one
// performer, playing one recording or carrying one genre, and one album with its credits,
// intended track list, editions and genres.
import { and, asc, count, eq, sql, type SQL } from "drizzle-orm";
import { matchKeyOf } from "../../../names/matchKeyOf.ts";
import { album } from "../../schema/albumTables.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";
import type { CatalogPage, PageRequest } from "../catalogPage.ts";
import { outerColumn } from "../outerColumn.ts";
import { albumCredits, creditLinesOf, creditsOf, type CreditRow } from "../credits/creditQueries.ts";
import { editionsOfAlbum, type EditionSummary } from "../editions/editionQueries.ts";
import { albumGenres, carriesGenre, genresOf, type GenreReference } from "../genres/genreAssignments.ts";
import { albumTracksOf, type AlbumTrackRow } from "./albumTrackQueries.ts";

export type AlbumFilters = { readonly performerId?: string | undefined; readonly recordingId?: string | undefined; readonly genreId?: string | undefined };
export type AlbumSummary = {
  readonly id: string;
  readonly title: string;
  readonly kind: string;
  readonly released: string | null;
  readonly creditLine: string;
  readonly trackCount: number;
  readonly editionCount: number;
};
export type AlbumDetail = Omit<AlbumSummary, "trackCount" | "editionCount"> & {
  readonly label: string | null;
  readonly notes: string | null;
  readonly credits: CreditRow[];
  readonly tracks: AlbumTrackRow[];
  readonly editions: EditionSummary[];
  readonly genres: GenreReference[];
};

const creditedOnAlbum = (performerMatch: SQL): SQL => sql`(exists (select 1 from album_credit c join performer_name n
    on n.library_id = c.library_id and n.performer_id = c.performer_id
    where c.library_id = ${album.libraryId} and c.album_id = ${album.id} and ${performerMatch})
  or exists (select 1 from album_track t join recording_credit c on c.library_id = t.library_id and c.recording_id = t.recording_id
    join performer_name n on n.library_id = c.library_id and n.performer_id = c.performer_id
    where t.library_id = ${album.libraryId} and t.album_id = ${album.id} and ${performerMatch}))`;

function albumMatches(query: string): SQL | undefined {
  const key = matchKeyOf(query);
  if (key === "") return undefined;
  const pattern = `%${key}%`;
  return sql`(${album.matchKey} like ${pattern} or ${creditedOnAlbum(sql`n.match_key like ${pattern}`)})`;
}

function albumFilter(filters: AlbumFilters): SQL | undefined {
  const crediting = filters.performerId === undefined ? undefined : creditedOnAlbum(sql`n.performer_id = ${filters.performerId}`);
  const playing = filters.recordingId === undefined ? undefined : sql`exists (select 1 from album_track t where t.library_id = ${album.libraryId}
    and t.album_id = ${album.id} and t.recording_id = ${filters.recordingId})`;
  return and(crediting, playing, carriesGenre(albumGenres, album.id, filters.genreId));
}

const [outerLibraryId, outerAlbumId] = [outerColumn(album.libraryId), outerColumn(album.id)];
const trackCount = sql<number>`(select count(*)::int from album_track t where t.library_id = ${outerLibraryId} and t.album_id = ${outerAlbumId})`;
const editionCount = sql<number>`(select count(*)::int from edition e where e.library_id = ${outerLibraryId} and e.album_id = ${outerAlbumId})`;

export async function listAlbums(tx: ScopedTransaction, page: PageRequest, filters: AlbumFilters = {}): Promise<CatalogPage<AlbumSummary>> {
  const where = and(albumMatches(page.query), albumFilter(filters));
  const { id, title, kind, released, matchKey } = album;
  const rows = await tx
    .select({ id, title, kind, released, trackCount, editionCount })
    .from(album)
    .where(where)
    .orderBy(asc(matchKey), asc(title), asc(id))
    .limit(page.limit)
    .offset(page.offset);
  const [counted] = await tx.select({ total: count() }).from(album).where(where);
  const lines = await creditLinesOf(tx, albumCredits, rows.map((row) => row.id));
  return { items: rows.map((row) => ({ ...row, creditLine: lines.get(row.id) ?? "" })), total: counted?.total ?? 0 };
}

export async function getAlbumDetail(tx: ScopedTransaction, albumId: string): Promise<AlbumDetail | null> {
  const { id, title, kind, released, label, notes } = album;
  const [row] = await tx.select({ id, title, kind, released, label, notes }).from(album).where(eq(id, albumId));
  if (row === undefined) return null;
  const credited = await creditsOf(tx, albumCredits, albumId);
  const tracks = await albumTracksOf(tx, albumId);
  return { ...row, ...credited, tracks, editions: await editionsOfAlbum(tx, albumId), genres: await genresOf(tx, albumGenres, albumId) };
}
