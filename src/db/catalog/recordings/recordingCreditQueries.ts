// Reads of recording credits: each credit under its performer's preferred name and the
// name it was credited as, every name of the credited performers, and the credit lines of
// a page of recordings in one query.
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { creditLineOf } from "../../../credits/creditLineOf.ts";
import { performerName } from "../../schema/performerTables.ts";
import { recordingCredit } from "../../schema/recordingTables.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";

type NameReference = { readonly id: string; readonly name: string };
export type CreditRow = {
  readonly performer: NameReference;
  readonly creditedName: NameReference | null;
  readonly role: string;
  readonly joinPhrase: string | null;
  readonly instruments: string[];
  readonly performerNames: NameReference[];
};
type StoredCredit = Awaited<ReturnType<typeof storedCreditsOf>>[number];

const preferred = alias(performerName, "preferred_name");
const credited = alias(performerName, "credited_name");

function storedCreditsOf(tx: ScopedTransaction, recordingIds: string[]) {
  const c = recordingCredit;
  return tx
    .select({ recordingId: c.recordingId, performerId: c.performerId, performerName: preferred.name, creditedNameId: c.creditedNameId, creditedName: credited.name, role: c.role, joinPhrase: c.joinPhrase, instruments: c.instruments })
    .from(c)
    .innerJoin(preferred, and(eq(preferred.libraryId, c.libraryId), eq(preferred.performerId, c.performerId), eq(preferred.isPreferred, true)))
    .leftJoin(credited, and(eq(credited.libraryId, c.libraryId), eq(credited.id, c.creditedNameId)))
    .where(inArray(c.recordingId, recordingIds))
    .orderBy(asc(c.recordingId), asc(c.position));
}

const creditLinePartOf = (stored: StoredCredit) => ({ name: stored.creditedName ?? stored.performerName, role: stored.role, joinPhrase: stored.joinPhrase });

export async function creditLinesOf(tx: ScopedTransaction, recordingIds: string[]): Promise<Map<string, string>> {
  if (recordingIds.length === 0) return new Map();
  const grouped = Map.groupBy(await storedCreditsOf(tx, recordingIds), (stored) => stored.recordingId);
  return new Map([...grouped].map(([recordingId, credits]) => [recordingId, creditLineOf(credits.map(creditLinePartOf))]));
}

async function namesByPerformer(tx: ScopedTransaction, performerIds: string[]): Promise<Map<string, NameReference[]>> {
  if (performerIds.length === 0) return new Map();
  const { performerId, id, name, isPreferred, sortName } = performerName;
  const rows = await tx.select({ performerId, id, name }).from(performerName).where(inArray(performerId, performerIds)).orderBy(desc(isPreferred), asc(sortName), asc(id));
  const grouped = Map.groupBy(rows, (row) => row.performerId);
  return new Map([...grouped].map(([performer, names]) => [performer, names.map((row) => ({ id: row.id, name: row.name }))]));
}

function creditRowOf(stored: StoredCredit, names: Map<string, NameReference[]>): CreditRow {
  const creditedName = stored.creditedNameId === null || stored.creditedName === null ? null : { id: stored.creditedNameId, name: stored.creditedName };
  const { role, joinPhrase, instruments } = stored;
  return { performer: { id: stored.performerId, name: stored.performerName }, creditedName, role, joinPhrase, instruments, performerNames: names.get(stored.performerId) ?? [] };
}

export async function creditsOf(tx: ScopedTransaction, recordingId: string): Promise<{ credits: CreditRow[]; creditLine: string }> {
  const stored = await storedCreditsOf(tx, [recordingId]);
  const names = await namesByPerformer(tx, [...new Set(stored.map((credit) => credit.performerId))]);
  return { credits: stored.map((credit) => creditRowOf(credit, names)), creditLine: creditLineOf(stored.map(creditLinePartOf)) };
}
