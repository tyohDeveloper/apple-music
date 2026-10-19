// Writes of recordings and their credits. The title is stored with collapsed whitespace
// and its match key; credits are replaced as a whole list (ADR-0009), and deleting a
// recording takes its credits with it.
import { eq, sql } from "drizzle-orm";
import { collapseWhitespace } from "../../../names/collapseWhitespace.ts";
import { matchKeyOf } from "../../../names/matchKeyOf.ts";
import { recording, recordingCredit } from "../../schema/recordingTables.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";

export type RecordingFields = {
  readonly title: string;
  readonly versionNote: string | null;
  readonly kind: string;
  readonly recordedFrom: string | null;
  readonly recordedTo: string | null;
  readonly venue: string | null;
  readonly durationMs: number | null;
  readonly notes: string | null;
};
export type CreditFields = {
  readonly performerId: string;
  readonly creditedNameId: string | null;
  readonly role: string;
  readonly joinPhrase: string | null;
  readonly instruments: string[];
};

function storedTitle(title: string) {
  const collapsed = collapseWhitespace(title);
  return { title: collapsed, matchKey: matchKeyOf(collapsed) };
}

export async function createRecording(tx: ScopedTransaction, libraryId: string, fields: RecordingFields): Promise<string> {
  const [created] = await tx.insert(recording).values({ libraryId, ...fields, ...storedTitle(fields.title) }).returning({ id: recording.id });
  if (created === undefined) throw new Error("insert into recording returned no row");
  return created.id;
}

export async function updateRecording(tx: ScopedTransaction, recordingId: string, changes: Partial<RecordingFields>): Promise<boolean> {
  const title = changes.title === undefined ? {} : storedTitle(changes.title);
  const updated = await tx
    .update(recording)
    .set({ ...changes, ...title, updatedAt: sql`now()` })
    .where(eq(recording.id, recordingId))
    .returning({ id: recording.id });
  return updated.length > 0;
}

export async function deleteRecording(tx: ScopedTransaction, recordingId: string): Promise<boolean> {
  const deleted = await tx.delete(recording).where(eq(recording.id, recordingId)).returning({ id: recording.id });
  return deleted.length > 0;
}

export async function replaceRecordingCredits(tx: ScopedTransaction, libraryId: string, recordingId: string, credits: readonly CreditFields[]): Promise<boolean> {
  if (!(await updateRecording(tx, recordingId, {}))) return false;
  await tx.delete(recordingCredit).where(eq(recordingCredit.recordingId, recordingId));
  if (credits.length > 0) await tx.insert(recordingCredit).values(credits.map((credit, position) => ({ libraryId, recordingId, position, ...credit })));
  return true;
}
