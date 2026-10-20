// Writes of genres and their aliases. Names are stored with collapsed whitespace beside
// their match keys. The database refuses a move that would make a genre its own ancestor
// (genre_no_cycle), and deleting a genre takes its aliases with it.
import { and, eq, sql } from "drizzle-orm";
import { genre, genreAlias } from "../../schema/genreTables.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";
import { storedTitle } from "../storedTitle.ts";

export type GenreFields = { readonly name: string; readonly parentId: string | null; readonly notes: string | null };

function storedName(name: string): { readonly name: string; readonly matchKey: string } {
  const { title, matchKey } = storedTitle(name);
  return { name: title, matchKey };
}

export async function createGenre(tx: ScopedTransaction, libraryId: string, fields: GenreFields): Promise<string> {
  const [created] = await tx.insert(genre).values({ libraryId, ...fields, ...storedName(fields.name) }).returning({ id: genre.id });
  if (created === undefined) throw new Error("insert into genre returned no row");
  return created.id;
}

export async function updateGenre(tx: ScopedTransaction, genreId: string, changes: Partial<GenreFields>): Promise<boolean> {
  const name = changes.name === undefined ? {} : storedName(changes.name);
  const updated = await tx
    .update(genre)
    .set({ ...changes, ...name, updatedAt: sql`now()` })
    .where(eq(genre.id, genreId))
    .returning({ id: genre.id });
  return updated.length > 0;
}

export async function deleteGenre(tx: ScopedTransaction, genreId: string): Promise<boolean> {
  const deleted = await tx.delete(genre).where(eq(genre.id, genreId)).returning({ id: genre.id });
  return deleted.length > 0;
}

export async function addGenreAlias(tx: ScopedTransaction, libraryId: string, genreId: string, name: string): Promise<void> {
  await tx.insert(genreAlias).values({ libraryId, genreId, ...storedName(name) });
}

export async function deleteGenreAlias(tx: ScopedTransaction, genreId: string, aliasId: string): Promise<boolean> {
  const deleted = await tx.delete(genreAlias).where(and(eq(genreAlias.genreId, genreId), eq(genreAlias.id, aliasId))).returning({ id: genreAlias.id });
  return deleted.length > 0;
}
