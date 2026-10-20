// Reads of ordered credits, for recordings and albums alike: each credit under its
// performer's preferred name and the name it was credited as, every name of the credited
// performers, and the credit lines of a page of entries in one query.
import { asc, desc, inArray, sql } from "drizzle-orm";
import { creditLineOf } from "../../../credits/creditLineOf.ts";
import { performerName } from "../../schema/performerTables.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";

export type CreditSource = { readonly table: "recording_credit" | "album_credit"; readonly owner: "recording_id" | "album_id" };
export const recordingCredits: CreditSource = { table: "recording_credit", owner: "recording_id" };

type NameReference = { readonly id: string; readonly name: string };
export type CreditRow = {
  readonly performer: NameReference;
  readonly creditedName: NameReference | null;
  readonly role: string;
  readonly joinPhrase: string | null;
  readonly instruments: string[];
  readonly performerNames: NameReference[];
};
type StoredCredit = {
  readonly ownerId: string;
  readonly performerId: string;
  readonly performerName: string;
  readonly creditedNameId: string | null;
  readonly creditedName: string | null;
  readonly role: string;
  readonly joinPhrase: string | null;
  readonly instruments: string[];
};

async function storedCreditsOf(tx: ScopedTransaction, source: CreditSource, ownerIds: string[]): Promise<StoredCredit[]> {
  const owner = sql.identifier(source.owner);
  const { rows } = await tx.execute<StoredCredit>(sql`
    select c.${owner} as "ownerId", c.performer_id as "performerId", p.name as "performerName",
      c.credited_name_id as "creditedNameId", n.name as "creditedName", c.role, c.join_phrase as "joinPhrase", c.instruments
    from ${sql.identifier(source.table)} c
    join performer_name p on p.library_id = c.library_id and p.performer_id = c.performer_id and p.is_preferred
    left join performer_name n on n.library_id = c.library_id and n.id = c.credited_name_id
    where c.${owner} = any(${sql.param(ownerIds)}::uuid[])
    order by c.${owner}, c.position`);
  return rows;
}

const creditLinePartOf = (stored: StoredCredit) => ({ name: stored.creditedName ?? stored.performerName, role: stored.role, joinPhrase: stored.joinPhrase });

export async function creditLinesOf(tx: ScopedTransaction, source: CreditSource, ownerIds: string[]): Promise<Map<string, string>> {
  if (ownerIds.length === 0) return new Map();
  const grouped = Map.groupBy(await storedCreditsOf(tx, source, ownerIds), (stored) => stored.ownerId);
  return new Map([...grouped].map(([ownerId, credits]) => [ownerId, creditLineOf(credits.map(creditLinePartOf))]));
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

export async function creditsOf(tx: ScopedTransaction, source: CreditSource, ownerId: string): Promise<{ credits: CreditRow[]; creditLine: string }> {
  const stored = await storedCreditsOf(tx, source, [ownerId]);
  const names = await namesByPerformer(tx, [...new Set(stored.map((credit) => credit.performerId))]);
  return { credits: stored.map((credit) => creditRowOf(credit, names)), creditLine: creditLineOf(stored.map(creditLinePartOf)) };
}
