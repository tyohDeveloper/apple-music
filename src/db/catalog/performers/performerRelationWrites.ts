// Standing relations between performers. The subject is the performer whose page adds the
// relation; a relation to a performer outside the library fails its composite foreign key.
import { and, eq, or } from "drizzle-orm";
import { performerRelation } from "../../schema/performerTables.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";

export type RelationFields = {
  readonly kind: string;
  readonly objectId: string;
  readonly roles: readonly string[];
  readonly began: string | null;
  readonly ended: string | null;
  readonly notes: string | null;
};

export async function addPerformerRelation(tx: ScopedTransaction, libraryId: string, subjectId: string, fields: RelationFields): Promise<string> {
  const [created] = await tx
    .insert(performerRelation)
    .values({ libraryId, subjectId, ...fields, roles: [...fields.roles] })
    .returning({ id: performerRelation.id });
  if (created === undefined) throw new Error("insert into performer_relation returned no row");
  return created.id;
}

export async function removePerformerRelation(tx: ScopedTransaction, performerId: string, relationId: string): Promise<boolean> {
  const touchesPerformer = or(eq(performerRelation.subjectId, performerId), eq(performerRelation.objectId, performerId));
  const deleted = await tx
    .delete(performerRelation)
    .where(and(eq(performerRelation.id, relationId), touchesPerformer))
    .returning({ id: performerRelation.id });
  return deleted.length > 0;
}
