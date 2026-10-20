// Reads of recordings (DOMAIN-MODEL.md): search by title or by any name of a credited
// performer, optionally only the recordings crediting one performer, and one recording
// with its credits. Row-level security limits every query to the scoped library.
import { and, asc, count, eq, inArray, sql, type SQL } from "drizzle-orm";
import { matchKeyOf } from "../../../names/matchKeyOf.ts";
import { recording } from "../../schema/recordingTables.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";
import type { CatalogPage, PageRequest } from "../catalogPage.ts";
import { creditLinesOf, creditsOf, recordingCredits, type CreditRow } from "../credits/creditQueries.ts";

export type RecordingSummary = {
  readonly id: string;
  readonly title: string;
  readonly versionNote: string | null;
  readonly kind: string;
  readonly recordedFrom: string | null;
  readonly durationMs: number | null;
  readonly creditLine: string;
};
export type RecordingDetail = RecordingSummary & {
  readonly recordedTo: string | null;
  readonly venue: string | null;
  readonly notes: string | null;
  readonly credits: CreditRow[];
};

function titleOrCreditMatches(query: string): SQL | undefined {
  const key = matchKeyOf(query);
  if (key === "") return undefined;
  const pattern = `%${key}%`;
  return sql`(${recording.matchKey} like ${pattern} or exists (select 1 from recording_credit c
    join performer_name n on n.library_id = c.library_id and n.performer_id = c.performer_id
    where c.library_id = ${recording.libraryId} and c.recording_id = ${recording.id} and n.match_key like ${pattern}))`;
}

function creditsPerformer(performerId: string | undefined): SQL | undefined {
  if (performerId === undefined) return undefined;
  return sql`exists (select 1 from recording_credit c where c.library_id = ${recording.libraryId}
    and c.recording_id = ${recording.id} and c.performer_id = ${performerId})`;
}

export async function listRecordings(tx: ScopedTransaction, page: PageRequest, performerId?: string): Promise<CatalogPage<RecordingSummary>> {
  const where = and(titleOrCreditMatches(page.query), creditsPerformer(performerId));
  const { id, title, versionNote, kind, recordedFrom, durationMs, matchKey } = recording;
  const rows = await tx
    .select({ id, title, versionNote, kind, recordedFrom, durationMs })
    .from(recording)
    .where(where)
    .orderBy(asc(matchKey), asc(title), asc(id))
    .limit(page.limit)
    .offset(page.offset);
  const [counted] = await tx.select({ total: count() }).from(recording).where(where);
  const lines = await creditLinesOf(tx, recordingCredits, rows.map((row) => row.id));
  return { items: rows.map((row) => ({ ...row, creditLine: lines.get(row.id) ?? "" })), total: counted?.total ?? 0 };
}

export type RecordingReference = Pick<RecordingSummary, "id" | "title" | "versionNote" | "durationMs" | "creditLine">;

// The recordings that tracks play, by id, for album and edition track lists.
export async function recordingReferencesOf(tx: ScopedTransaction, recordingIds: string[]): Promise<Map<string, RecordingReference>> {
  if (recordingIds.length === 0) return new Map();
  const { id, title, versionNote, durationMs } = recording;
  const rows = await tx.select({ id, title, versionNote, durationMs }).from(recording).where(inArray(id, recordingIds));
  const lines = await creditLinesOf(tx, recordingCredits, recordingIds);
  return new Map(rows.map((row) => [row.id, { ...row, creditLine: lines.get(row.id) ?? "" }]));
}

export async function getRecordingDetail(tx: ScopedTransaction, recordingId: string): Promise<RecordingDetail | null> {
  const { id, title, versionNote, kind, recordedFrom, recordedTo, venue, durationMs, notes } = recording;
  const [row] = await tx.select({ id, title, versionNote, kind, recordedFrom, recordedTo, venue, durationMs, notes }).from(recording).where(eq(id, recordingId));
  if (row === undefined) return null;
  return { ...row, ...(await creditsOf(tx, recordingCredits, recordingId)) };
}
