// Looks up the catalog songs or albums the run's library items point to, in batches Apple
// accepts (300 songs or 100 albums a request), and stores each batch in its own transaction
// (docs/design/apple-music-import.md, slice H). Ids Apple does not return, no longer in the
// catalog or not in this storefront, are skipped; Apple answers 200 without them.
import { AppleMusicFailure } from "../../apple-music/appleMusicFailure.ts";
import { upsertCatalogItems } from "../../db/apple-music/catalogItems.ts";
import { catalogIdsSeenIn } from "../../db/apple-music/mirrorItems.ts";
import { recordSyncProgress } from "../../db/apple-music/syncRuns.ts";
import { appleResourcesOf } from "../../library-sync/appleResourcesOf.ts";
import { batchesOf } from "../../library-sync/batchesOf.ts";
import { catalogPathOf, type CatalogKind } from "../../library-sync/catalogPathOf.ts";
import { stopIfAborted, type SyncTask } from "./syncTask.ts";

const progressOf = {
  song: { phase: "catalog-songs", count: "catalogSongs" },
  album: { phase: "catalog-albums", count: "catalogAlbums" },
} as const;

export async function mirrorCatalog(task: SyncTask, kind: CatalogKind): Promise<void> {
  const { phase, count } = progressOf[kind];
  const catalogIds = await task.inLibrary(async (tx) => {
    await recordSyncProgress(tx, task.ids, phase);
    return catalogIdsSeenIn(tx, task.ids, kind);
  });
  const size = kind === "song" ? task.settings.catalogSongBatch : task.settings.catalogAlbumBatch;
  for (const batch of batchesOf(catalogIds, size)) {
    stopIfAborted(task.signal);
    const page = appleResourcesOf(await task.client.get({ path: catalogPathOf(task.storefront, kind, batch), musicUserToken: null }));
    if (page === null) throw new AppleMusicFailure("apple-music-unexpected", 200);
    await task.inLibrary(async (tx) => {
      await upsertCatalogItems(tx, task.ids, task.storefront, kind, page.resources);
      await recordSyncProgress(tx, task.ids, phase, count, page.resources.length);
    });
  }
}
