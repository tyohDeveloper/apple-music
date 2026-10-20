// One sync run from start to end (docs/design/apple-music-import.md, slice H; docs/
// ARCHITECTURE.md, Import pipeline): open the Music User Token, page the four library lists
// into the mirror, stop for confirmation when the guard says so, look up the catalog songs
// and albums, mark what Apple no longer lists as removed, then finish the run with what
// changed. A failure, a cancellation or a shutdown also finishes the run, with its reason; a
// failure after a cancellation or shutdown was asked for finishes it as asked.
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { FastifyBaseLogger } from "fastify";
import { AppleMusicFailure } from "../../apple-music/appleMusicFailure.ts";
import { forgetItemsFirstSeenIn, markUnseenRemoved, runChangeCountsOf, storedItemCount } from "../../db/apple-music/mirrorItems.ts";
import { finishSyncRun, recordSyncProgress, type SyncEnd } from "../../db/apple-music/syncRuns.ts";
import { runInLibrary } from "../../db/catalog/runInLibrary.ts";
import type { LibraryScope } from "../../db/withLibraryScope.ts";
import type { LibraryKind } from "../../library-sync/libraryPathOf.ts";
import { mirrorGuardOf } from "../../library-sync/mirrorGuardOf.ts";
import { openToken } from "../../platform/tokenCipher.ts";
import type { SyncSettings } from "../config/readServerConfig.ts";
import type { AppleMusicServices } from "./appleMusicServices.ts";
import { mirrorCatalog } from "./mirrorCatalog.ts";
import { mirrorLibraryList } from "./mirrorLibraryList.ts";
import { stopIfAborted, stopReasonOf, SyncStopped, type SyncTask } from "./syncTask.ts";

export type SyncJob = {
  readonly scope: LibraryScope;
  readonly runId: string;
  readonly replaceMirror: boolean;
  readonly storefront: string;
  readonly sealedToken: string;
  readonly services: AppleMusicServices;
};
export type SyncDependencies = { readonly db: NodePgDatabase; readonly settings: SyncSettings; readonly log: FastifyBaseLogger };

const libraryKinds: readonly LibraryKind[] = ["song", "album", "artist", "playlist"];

class TokenUnreadable extends Error {}

function taskOf(deps: SyncDependencies, job: SyncJob, signal: AbortSignal): SyncTask {
  let musicUserToken: string;
  try {
    musicUserToken = openToken([job.services.tokenKey], job.scope.libraryId, job.sealedToken);
  } catch {
    throw new TokenUnreadable("the stored Music User Token cannot be opened");
  }
  const ids = { libraryId: job.scope.libraryId, runId: job.runId };
  const { client } = job.services;
  return { ids, client, musicUserToken, storefront: job.storefront, settings: deps.settings, signal, inLibrary: (work) => runInLibrary(deps.db, job.scope, work) };
}

async function mirrorAll(task: SyncTask, replaceMirror: boolean): Promise<SyncEnd> {
  const storedBefore = await task.inLibrary((tx) => storedItemCount(tx, task.ids.libraryId));
  for (const kind of libraryKinds) await mirrorLibraryList(task, kind);
  const { reseen } = await task.inLibrary((tx) => runChangeCountsOf(tx, task.ids));
  if (mirrorGuardOf({ storedBefore, reseen, replaceMirror }) === "needs-confirmation") {
    await task.inLibrary((tx) => forgetItemsFirstSeenIn(tx, task.ids));
    return { status: "needs-confirmation", errorCode: null };
  }
  await mirrorCatalog(task, "song");
  await mirrorCatalog(task, "album");
  stopIfAborted(task.signal);
  await task.inLibrary(async (tx) => {
    await recordSyncProgress(tx, task.ids, "removals");
    await markUnseenRemoved(tx, task.ids);
  });
  return { status: "succeeded", errorCode: null };
}

function endOf(error: unknown, signal: AbortSignal, log: FastifyBaseLogger): SyncEnd {
  if (error instanceof SyncStopped) return { status: error.reason, errorCode: null };
  const expected = error instanceof AppleMusicFailure || error instanceof TokenUnreadable;
  if (!expected) log.error(error);
  if (signal.aborted) return { status: stopReasonOf(signal), errorCode: null };
  if (error instanceof AppleMusicFailure) return { status: "failed", errorCode: error.code };
  return { status: "failed", errorCode: expected ? "apple-music-token-unreadable" : "unexpected" };
}

export async function runLibrarySync(deps: SyncDependencies, job: SyncJob, signal: AbortSignal): Promise<SyncEnd> {
  const attempt = async (): Promise<SyncEnd> => mirrorAll(taskOf(deps, job, signal), job.replaceMirror);
  const end = await attempt().catch((error: unknown) => endOf(error, signal, deps.log));
  const ids = { libraryId: job.scope.libraryId, runId: job.runId };
  await runInLibrary(deps.db, job.scope, async (tx) => {
    const { added, changed, removed } = await runChangeCountsOf(tx, ids);
    await finishSyncRun(tx, ids, end, { added, changed, removed });
  });
  return end;
}
