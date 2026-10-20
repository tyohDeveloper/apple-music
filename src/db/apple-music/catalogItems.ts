// The mirror's catalog songs and albums (docs/design/apple-music-import.md, slice H), stored
// by storefront as Apple returned them and replaced whenever a run fetches them again.
import { sql } from "drizzle-orm";
import type { AppleResource } from "../../library-sync/appleResourcesOf.ts";
import type { CatalogKind } from "../../library-sync/catalogPathOf.ts";
import { appleCatalogItem as item } from "../schema/syncTables.ts";
import type { ScopedTransaction } from "../withUserScope.ts";
import type { RunIds } from "./syncRuns.ts";

export async function upsertCatalogItems(tx: ScopedTransaction, ids: RunIds, storefront: string, kind: CatalogKind, resources: readonly AppleResource[]): Promise<void> {
  if (resources.length === 0) return;
  const rows = resources.map((resource) => ({
    libraryId: ids.libraryId, kind, storefront, catalogId: resource.id, attributes: resource.attributes, relationships: resource.relationships, fetchedRunId: ids.runId,
  }));
  await tx.insert(item).values(rows).onConflictDoUpdate({
    target: [item.libraryId, item.kind, item.storefront, item.catalogId],
    set: { attributes: sql`excluded.attributes`, relationships: sql`excluded.relationships`, fetchedRunId: sql`excluded.fetched_run_id` },
  });
}
