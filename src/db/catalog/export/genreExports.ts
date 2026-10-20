// Every genre of the scoped library for its export, with its aliases, in creation order.
import { sql } from "drizzle-orm";
import type { ExportGenre } from "../../../contracts/export/exportGenreSchema.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";
import { instantText } from "./exportFragments.ts";

export async function genreExportsOf(tx: ScopedTransaction): Promise<ExportGenre[]> {
  const { rows } = await tx.execute<ExportGenre>(sql`
    select g.id, g.parent_id as "parentId", g.name, g.notes,
      coalesce((select json_agg(json_build_object('id', a.id, 'name', a.name) order by a.name, a.id)
        from genre_alias a where a.library_id = g.library_id and a.genre_id = g.id), '[]'::json) as aliases,
      ${instantText(sql`g.created_at`)} as "createdAt", ${instantText(sql`g.updated_at`)} as "updatedAt"
    from genre g order by g.created_at, g.id`);
  return rows;
}
