// Every performer of the scoped library for its export, with its names (the preferred one
// first), genres and identifiers, in creation order; and every relation between them.
import { sql } from "drizzle-orm";
import type { ExportPerformerRelation } from "../../../contracts/export/exportPerformerRelationSchema.ts";
import type { ExportPerformer } from "../../../contracts/export/exportPerformerSchema.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";
import { performerGenres } from "../genres/genreAssignments.ts";
import { performerExternalIds } from "../identifiers/externalIds.ts";
import { externalIdsJson, genreIdsJson, instantText } from "./exportFragments.ts";

const namesJson = sql`coalesce((select json_agg(json_build_object('id', n.id, 'name', n.name, 'sortName', n.sort_name,
    'kind', n.kind, 'locale', n.locale, 'validFrom', n.valid_from, 'validTo', n.valid_to, 'isPreferred', n.is_preferred)
    order by n.is_preferred desc, n.sort_name, n.id)
  from performer_name n where n.library_id = p.library_id and n.performer_id = p.id), '[]'::json)`;

export async function performerExportsOf(tx: ScopedTransaction): Promise<ExportPerformer[]> {
  const { rows } = await tx.execute<ExportPerformer>(sql`
    select p.id, p.kind, p.began, p.ended, p.area, p.disambiguation, p.notes, ${namesJson} as names,
      ${genreIdsJson(performerGenres, "p")} as "genreIds", ${externalIdsJson(performerExternalIds, "p")} as "externalIds",
      ${instantText(sql`p.created_at`)} as "createdAt", ${instantText(sql`p.updated_at`)} as "updatedAt"
    from performer p order by p.created_at, p.id`);
  return rows;
}

export async function performerRelationExportsOf(tx: ScopedTransaction): Promise<ExportPerformerRelation[]> {
  const { rows } = await tx.execute<ExportPerformerRelation>(sql`
    select r.id, r.subject_id as "subjectId", r.object_id as "objectId", r.kind, r.roles, r.began, r.ended, r.notes
    from performer_relation r order by r.subject_id, r.kind, r.object_id, r.id`);
  return rows;
}
