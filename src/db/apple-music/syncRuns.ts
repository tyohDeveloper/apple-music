// Sync runs of a library (docs/design/apple-music-import.md, slice H): starting one, at most
// one running (the sync_run_one_running index refuses a second), reading the latest,
// recording progress as pages arrive, and finishing. Only a running run is finished, so a
// cancellation and the end of the task cannot both win.
import { and, desc, eq, sql } from "drizzle-orm";
import type { PgUpdateSetSource } from "drizzle-orm/pg-core";
import { syncRun } from "../schema/syncTables.ts";
import type { ScopedTransaction } from "../withUserScope.ts";

export type SyncRunRow = typeof syncRun.$inferSelect;
export type RunIds = { readonly libraryId: string; readonly runId: string };
export type SyncPhase = "songs" | "albums" | "artists" | "playlists" | "catalog-songs" | "catalog-albums" | "removals";
export type SyncCount = "songs" | "albums" | "artists" | "playlists" | "catalogSongs" | "catalogAlbums";
export type SyncEnd = {
  readonly status: "succeeded" | "failed" | "interrupted" | "needs-confirmation" | "cancelled";
  readonly errorCode: string | null;
};
export type MirrorChanges = { readonly added: number; readonly changed: number; readonly removed: number };

const runIs = (ids: RunIds) => and(eq(syncRun.libraryId, ids.libraryId), eq(syncRun.id, ids.runId));

export async function startSyncRun(tx: ScopedTransaction, libraryId: string, userId: string, replaceMirror: boolean): Promise<SyncRunRow> {
  const [row] = await tx.insert(syncRun).values({ libraryId, startedBy: userId, replaceMirror }).returning();
  if (row === undefined) throw new Error("sync_run insert returned no row");
  return row;
}

export async function latestSyncRun(tx: ScopedTransaction, libraryId: string): Promise<SyncRunRow | null> {
  const [row] = await tx.select().from(syncRun).where(eq(syncRun.libraryId, libraryId)).orderBy(desc(syncRun.startedAt)).limit(1);
  return row ?? null;
}

export async function syncRunOf(tx: ScopedTransaction, ids: RunIds): Promise<SyncRunRow | null> {
  const [row] = await tx.select().from(syncRun).where(runIs(ids));
  return row ?? null;
}

// Moves the run to a phase and adds what a page or batch brought to one of its counts.
export async function recordSyncProgress(tx: ScopedTransaction, ids: RunIds, phase: SyncPhase, count?: SyncCount, amount = 0): Promise<void> {
  const set: PgUpdateSetSource<typeof syncRun> = { phase };
  if (count !== undefined) set[count] = sql`${syncRun[count]} + ${amount}`;
  await tx.update(syncRun).set(set).where(and(runIs(ids), eq(syncRun.status, "running")));
}

// True when the run was still running and is now finished.
export async function finishSyncRun(tx: ScopedTransaction, ids: RunIds, end: SyncEnd, changes: MirrorChanges): Promise<boolean> {
  const finished = await tx
    .update(syncRun)
    .set({ status: end.status, errorCode: end.errorCode, finishedAt: sql`now()`, ...changes })
    .where(and(runIs(ids), eq(syncRun.status, "running")))
    .returning({ id: syncRun.id });
  return finished.length === 1;
}
