// Reads of genres (docs/design/catalog.md, Genres): search by name or alias in tree order,
// each genre with its path, and one genre with its path, aliases, subgenres and uses.
// Row-level security limits every query to the scoped library.
import { asc, eq, sql, type SQL } from "drizzle-orm";
import { matchKeyOf } from "../../../names/matchKeyOf.ts";
import { genre, genreAlias } from "../../schema/genreTables.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";
import type { CatalogPage, PageRequest } from "../catalogPage.ts";

type Reference = { readonly id: string; readonly name: string };
export type GenreSummary = { readonly id: string; readonly name: string; readonly path: string[]; readonly subgenreCount: number; readonly useCount: number };
export type GenreUses = { readonly albums: number; readonly recordings: number; readonly performers: number };
export type GenreDetail = Reference & {
  readonly notes: string | null;
  readonly path: Reference[];
  readonly aliases: Reference[];
  readonly subgenres: Reference[];
  readonly uses: GenreUses;
};

// Over rows named g, from the genre table or the tree below.
function genreMatches(query: string): SQL {
  const key = matchKeyOf(query);
  if (key === "") return sql`true`;
  const pattern = `%${key}%`;
  return sql`(g.match_key like ${pattern} or exists (select 1 from genre_alias a where a.genre_id = g.id and a.match_key like ${pattern}))`;
}

const useCount = sql`(select count(*) from album_genre u where u.genre_id = g.id)
  + (select count(*) from recording_genre u where u.genre_id = g.id) + (select count(*) from performer_genre u where u.genre_id = g.id)`;

export async function listGenres(tx: ScopedTransaction, page: PageRequest): Promise<CatalogPage<GenreSummary>> {
  const matches = genreMatches(page.query);
  const { rows } = await tx.execute<GenreSummary>(sql`
    with recursive tree(id, name, match_key, path, sort_path) as (
      select g.id, g.name, g.match_key, array[]::text[], array[g.match_key] from genre g where g.parent_id is null
      union all
      select g.id, g.name, g.match_key, t.path || t.name, t.sort_path || g.match_key from genre g join tree t on g.parent_id = t.id
    )
    select g.id, g.name, g.path, (select count(*)::int from genre c where c.parent_id = g.id) as "subgenreCount", (${useCount})::int as "useCount"
    from tree g where ${matches}
    order by g.sort_path collate "C", g.id
    limit ${page.limit} offset ${page.offset}`);
  const { rows: counted } = await tx.execute<{ total: number }>(sql`select count(*)::int as total from genre g where ${matches}`);
  return { items: rows, total: counted[0]?.total ?? 0 };
}

async function pathOf(tx: ScopedTransaction, genreId: string): Promise<Reference[]> {
  const { rows } = await tx.execute<Reference>(sql`
    with recursive up(id, name, parent_id, depth) as (
      select p.id, p.name, p.parent_id, 1 from genre g join genre p on p.id = g.parent_id where g.id = ${genreId}
      union all
      select p.id, p.name, p.parent_id, u.depth + 1 from up u join genre p on p.id = u.parent_id where u.depth < 100
    )
    select id, name from up order by depth desc`);
  return rows;
}

async function usesOf(tx: ScopedTransaction, genreId: string): Promise<GenreUses> {
  const { rows } = await tx.execute<GenreUses>(sql`select
    (select count(*)::int from album_genre where genre_id = ${genreId}) as albums,
    (select count(*)::int from recording_genre where genre_id = ${genreId}) as recordings,
    (select count(*)::int from performer_genre where genre_id = ${genreId}) as performers`);
  return rows[0] ?? { albums: 0, recordings: 0, performers: 0 };
}

export async function getGenreDetail(tx: ScopedTransaction, genreId: string): Promise<GenreDetail | null> {
  const [row] = await tx.select({ id: genre.id, name: genre.name, notes: genre.notes }).from(genre).where(eq(genre.id, genreId));
  if (row === undefined) return null;
  const aliases = await tx.select({ id: genreAlias.id, name: genreAlias.name }).from(genreAlias).where(eq(genreAlias.genreId, genreId)).orderBy(asc(genreAlias.matchKey));
  const subgenres = await tx.select({ id: genre.id, name: genre.name }).from(genre).where(eq(genre.parentId, genreId)).orderBy(asc(genre.matchKey), asc(genre.id));
  return { ...row, path: await pathOf(tx, genreId), aliases, subgenres, uses: await usesOf(tx, genreId) };
}
