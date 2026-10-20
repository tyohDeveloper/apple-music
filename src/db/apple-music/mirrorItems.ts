// The mirror's library items (docs/design/apple-music-import.md, slice H). Each page is
// upserted as it arrives: a new item records the run as first seen, last seen and changed; a
// known one records it as last seen, and as changed when its catalog id, attributes or
// relationships differ (jsonb compares values, not text) or it had been marked removed.
// After the listing, items the run did not see are marked removed, unless the guard stops
// the run, which then forgets the items it added.
import { and, eq, isNotNull, isNull, ne, sql } from "drizzle-orm";
import type { AppleResource } from "../../library-sync/appleResourcesOf.ts";
import { catalogIdOf } from "../../library-sync/catalogIdOf.ts";
import type { LibraryKind } from "../../library-sync/libraryPathOf.ts";
import { appleLibraryItem as item } from "../schema/syncTables.ts";
import type { ScopedTransaction } from "../withUserScope.ts";
import type { RunIds } from "./syncRuns.ts";

export type RunChangeCounts = { readonly added: number; readonly changed: number; readonly removed: number; readonly reseen: number };

const differs = sql`(${item.catalogId}, ${item.attributes}, ${item.relationships}) is distinct from (excluded.catalog_id, excluded.attributes, excluded.relationships) or ${item.removedRunId} is not null`;

export async function upsertLibraryItems(tx: ScopedTransaction, ids: RunIds, kind: LibraryKind, resources: readonly AppleResource[]): Promise<void> {
  if (resources.length === 0) return;
  const { libraryId, runId } = ids;
  const rows = resources.map((resource) => ({
    libraryId, kind, appleId: resource.id, catalogId: catalogIdOf(resource), attributes: resource.attributes, relationships: resource.relationships,
    firstSeenRunId: runId, lastSeenRunId: runId, changedRunId: runId,
  }));
  await tx.insert(item).values(rows).onConflictDoUpdate({
    target: [item.libraryId, item.kind, item.appleId],
    set: {
      catalogId: sql`excluded.catalog_id`, attributes: sql`excluded.attributes`, relationships: sql`excluded.relationships`,
      lastSeenRunId: sql`excluded.last_seen_run_id`, changedRunId: sql`case when ${differs} then excluded.changed_run_id else ${item.changedRunId} end`, removedRunId: null,
    },
  });
}

// Items in the mirror that are not marked removed.
export async function storedItemCount(tx: ScopedTransaction, libraryId: string): Promise<number> {
  const [row] = await tx.select({ count: sql<number>`count(*)::int` }).from(item).where(and(eq(item.libraryId, libraryId), isNull(item.removedRunId)));
  return row?.count ?? 0;
}

export async function runChangeCountsOf(tx: ScopedTransaction, ids: RunIds): Promise<RunChangeCounts> {
  const run = ids.runId;
  const [row] = await tx.select({
    added: sql<number>`count(*) filter (where ${item.firstSeenRunId} = ${run})::int`,
    changed: sql<number>`count(*) filter (where ${item.changedRunId} = ${run} and ${item.firstSeenRunId} <> ${run})::int`,
    removed: sql<number>`count(*) filter (where ${item.removedRunId} = ${run})::int`,
    reseen: sql<number>`count(*) filter (where ${item.lastSeenRunId} = ${run} and ${item.firstSeenRunId} <> ${run})::int`,
  }).from(item).where(eq(item.libraryId, ids.libraryId));
  return row ?? { added: 0, changed: 0, removed: 0, reseen: 0 };
}

export async function markUnseenRemoved(tx: ScopedTransaction, ids: RunIds): Promise<void> {
  await tx.update(item).set({ removedRunId: ids.runId }).where(and(eq(item.libraryId, ids.libraryId), isNull(item.removedRunId), ne(item.lastSeenRunId, ids.runId)));
}

export async function forgetItemsFirstSeenIn(tx: ScopedTransaction, ids: RunIds): Promise<void> {
  await tx.delete(item).where(and(eq(item.libraryId, ids.libraryId), eq(item.firstSeenRunId, ids.runId)));
}

// Distinct catalog ids of the songs or albums the run saw, in order.
export async function catalogIdsSeenIn(tx: ScopedTransaction, ids: RunIds, kind: "song" | "album"): Promise<string[]> {
  const rows = await tx.selectDistinct({ catalogId: item.catalogId }).from(item)
    .where(and(eq(item.libraryId, ids.libraryId), eq(item.kind, kind), eq(item.lastSeenRunId, ids.runId), isNotNull(item.catalogId)))
    .orderBy(item.catalogId);
  return rows.flatMap((row) => (row.catalogId === null ? [] : [row.catalogId]));
}
