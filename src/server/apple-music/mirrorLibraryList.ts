// Pages one library list into the mirror (docs/design/apple-music-import.md, slice H). Each
// page is fetched, then upserted with the run's count in its own transaction, so no
// transaction waits on Apple. A first page answered 404 is read as an empty list: Apple
// documents 404 for a missing single resource, and a list with nothing in it must not fail
// the run.
import { AppleMusicFailure } from "../../apple-music/appleMusicFailure.ts";
import { upsertLibraryItems } from "../../db/apple-music/mirrorItems.ts";
import { recordSyncProgress } from "../../db/apple-music/syncRuns.ts";
import { appleResourcesOf, type AppleResourcePage } from "../../library-sync/appleResourcesOf.ts";
import { libraryPathOf, type LibraryKind } from "../../library-sync/libraryPathOf.ts";
import { nextOffsetOf } from "../../library-sync/nextOffsetOf.ts";
import { stopIfAborted, type SyncTask } from "./syncTask.ts";

const progressOf = { song: "songs", album: "albums", artist: "artists", playlist: "playlists" } as const;
const emptyPage: AppleResourcePage = { resources: [], next: null };

async function pageAt(task: SyncTask, kind: LibraryKind, offset: number): Promise<AppleResourcePage> {
  const request = { path: libraryPathOf(kind, offset, task.settings.pageSize), musicUserToken: task.musicUserToken };
  const body = await task.client.get(request).catch((error: unknown) => {
    if (offset === 0 && error instanceof AppleMusicFailure && error.status === 404) return emptyPage;
    throw error;
  });
  const page = body === emptyPage ? emptyPage : appleResourcesOf(body);
  if (page === null) throw new AppleMusicFailure("apple-music-unexpected", 200);
  return page;
}

export async function mirrorLibraryList(task: SyncTask, kind: LibraryKind): Promise<void> {
  const progress = progressOf[kind];
  for (let offset: number | "done" = 0; offset !== "done"; ) {
    stopIfAborted(task.signal);
    const page = await pageAt(task, kind, offset);
    await task.inLibrary(async (tx) => {
      await upsertLibraryItems(tx, task.ids, kind, page.resources);
      await recordSyncProgress(tx, task.ids, progress, progress, page.resources.length);
    });
    const next = nextOffsetOf(page.next, offset);
    if (next === "malformed") throw new AppleMusicFailure("apple-music-unexpected", 200);
    offset = next;
  }
}
