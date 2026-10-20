// The ordered genres of an album, a recording or a performer (docs/design/catalog.md,
// Genres): read under the genres' names, and replaced as a whole list whose first genre
// is the main one.
import { sql, type Column, type SQL } from "drizzle-orm";
import type { ScopedTransaction } from "../../withUserScope.ts";

export type GenreSource = {
  readonly table: "album_genre" | "recording_genre" | "performer_genre";
  readonly owner: "album_id" | "recording_id" | "performer_id";
  readonly ownerTable: "album" | "recording" | "performer";
};
export const albumGenres: GenreSource = { table: "album_genre", owner: "album_id", ownerTable: "album" };
export const recordingGenres: GenreSource = { table: "recording_genre", owner: "recording_id", ownerTable: "recording" };
export const performerGenres: GenreSource = { table: "performer_genre", owner: "performer_id", ownerTable: "performer" };

export type GenreReference = { readonly id: string; readonly name: string };

// A list filter: the owner, as a column of the outer query's table, carries the genre.
export function carriesGenre(source: GenreSource, ownerId: Column, genreId: string | undefined): SQL | undefined {
  if (genreId === undefined) return undefined;
  return sql`exists (select 1 from ${sql.identifier(source.table)} a where a.${sql.identifier(source.owner)} = ${ownerId} and a.genre_id = ${genreId})`;
}

export async function genresOf(tx: ScopedTransaction, source: GenreSource, ownerId: string): Promise<GenreReference[]> {
  const { rows } = await tx.execute<GenreReference>(sql`select g.id, g.name from ${sql.identifier(source.table)} a
    join genre g on g.library_id = a.library_id and g.id = a.genre_id
    where a.${sql.identifier(source.owner)} = ${ownerId} order by a.position`);
  return rows;
}

// False when the album, recording or performer is not in the library.
export async function replaceGenres(tx: ScopedTransaction, source: GenreSource, libraryId: string, ownerId: string, genreIds: readonly string[]): Promise<boolean> {
  const { rows } = await tx.execute(sql`update ${sql.identifier(source.ownerTable)} set updated_at = now() where id = ${ownerId} returning id`);
  if (rows.length === 0) return false;
  const [table, owner] = [sql.identifier(source.table), sql.identifier(source.owner)];
  await tx.execute(sql`delete from ${table} where ${owner} = ${ownerId}`);
  if (genreIds.length === 0) return true;
  await tx.execute(sql`insert into ${table} (library_id, ${owner}, position, genre_id)
    select ${libraryId}::uuid, ${ownerId}::uuid, chosen.ordinality - 1, chosen.genre_id
    from unnest(${sql.param(genreIds)}::uuid[]) with ordinality as chosen(genre_id, ordinality)`);
  return true;
}
