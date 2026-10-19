// A performer's names. Making a name preferred clears the previous one first, because the
// partial unique index allows one at a time; the deferred trigger refuses, at commit, a
// performer left with none (invariant 2).
import { and, eq, sql } from "drizzle-orm";
import { collapseWhitespace } from "../../../names/collapseWhitespace.ts";
import { matchKeyOf } from "../../../names/matchKeyOf.ts";
import { performer, performerName } from "../../schema/performerTables.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";
import { storedName, type NameFields } from "./performerWrites.ts";

export type NameChanges = Partial<Omit<NameFields, "name" | "sortName">> & {
  readonly name?: string;
  readonly sortName?: string;
  readonly isPreferred?: true;
};

function nameOfPerformer(performerId: string, nameId: string) {
  return and(eq(performerName.id, nameId), eq(performerName.performerId, performerId));
}

async function clearPreferred(tx: ScopedTransaction, performerId: string): Promise<void> {
  await tx
    .update(performerName)
    .set({ isPreferred: false })
    .where(and(eq(performerName.performerId, performerId), eq(performerName.isPreferred, true)));
}

async function touchPerformer(tx: ScopedTransaction, performerId: string): Promise<void> {
  await tx.update(performer).set({ updatedAt: sql`now()` }).where(eq(performer.id, performerId));
}

export async function addPerformerName(
  tx: ScopedTransaction,
  libraryId: string,
  performerId: string,
  fields: NameFields & { readonly isPreferred: boolean },
): Promise<string> {
  if (fields.isPreferred) await clearPreferred(tx, performerId);
  const [created] = await tx
    .insert(performerName)
    .values({ libraryId, performerId, ...storedName(fields), isPreferred: fields.isPreferred })
    .returning({ id: performerName.id });
  if (created === undefined) throw new Error("insert into performer_name returned no row");
  await touchPerformer(tx, performerId);
  return created.id;
}

function storedChanges(changes: NameChanges) {
  const name = changes.name === undefined ? {} : { name: collapseWhitespace(changes.name), matchKey: matchKeyOf(changes.name) };
  const sortName = changes.sortName === undefined ? {} : { sortName: collapseWhitespace(changes.sortName) };
  return { ...changes, ...name, ...sortName };
}

export async function updatePerformerName(tx: ScopedTransaction, performerId: string, nameId: string, changes: NameChanges): Promise<boolean> {
  const [existing] = await tx.select({ id: performerName.id }).from(performerName).where(nameOfPerformer(performerId, nameId));
  if (existing === undefined) return false;
  if (changes.isPreferred === true) await clearPreferred(tx, performerId);
  await tx.update(performerName).set(storedChanges(changes)).where(nameOfPerformer(performerId, nameId));
  await touchPerformer(tx, performerId);
  return true;
}

export async function removePerformerName(tx: ScopedTransaction, performerId: string, nameId: string): Promise<boolean> {
  const deleted = await tx.delete(performerName).where(nameOfPerformer(performerId, nameId)).returning({ id: performerName.id });
  if (deleted.length > 0) await touchPerformer(tx, performerId);
  return deleted.length > 0;
}
