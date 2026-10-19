// Writes of performers. A performer is created with its preferred name; its names and
// relations go with it on delete, and a performer still credited cannot be deleted
// (ADR-0009). Names are stored with collapsed whitespace and their match key.
import { eq, sql } from "drizzle-orm";
import { collapseWhitespace } from "../../../names/collapseWhitespace.ts";
import { matchKeyOf } from "../../../names/matchKeyOf.ts";
import { performer, performerName } from "../../schema/performerTables.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";

export type PerformerFields = {
  readonly kind: string;
  readonly began: string | null;
  readonly ended: string | null;
  readonly area: string | null;
  readonly disambiguation: string | null;
  readonly notes: string | null;
};
export type NameFields = {
  readonly name: string;
  readonly sortName: string | null;
  readonly kind: string;
  readonly locale: string | null;
  readonly validFrom: string | null;
  readonly validTo: string | null;
};

export function storedName(fields: NameFields) {
  const name = collapseWhitespace(fields.name);
  const sortName = fields.sortName === null ? name : collapseWhitespace(fields.sortName);
  return { ...fields, name, sortName, matchKey: matchKeyOf(name) };
}

export async function createPerformer(tx: ScopedTransaction, libraryId: string, fields: PerformerFields, name: NameFields): Promise<string> {
  const [created] = await tx.insert(performer).values({ libraryId, ...fields }).returning({ id: performer.id });
  if (created === undefined) throw new Error("insert into performer returned no row");
  await tx.insert(performerName).values({ libraryId, performerId: created.id, ...storedName(name), isPreferred: true });
  return created.id;
}

export async function updatePerformer(tx: ScopedTransaction, performerId: string, changes: Partial<PerformerFields>): Promise<boolean> {
  const updated = await tx
    .update(performer)
    .set({ ...changes, updatedAt: sql`now()` })
    .where(eq(performer.id, performerId))
    .returning({ id: performer.id });
  return updated.length > 0;
}

export async function deletePerformer(tx: ScopedTransaction, performerId: string): Promise<boolean> {
  const deleted = await tx.delete(performer).where(eq(performer.id, performerId)).returning({ id: performer.id });
  return deleted.length > 0;
}
