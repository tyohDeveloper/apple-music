// What the steps of one sync run share (docs/design/apple-music-import.md, slice H): the
// run's ids, the Apple Music client with the opened Music User Token, the storefront, page
// and batch sizes, a way to work in the library's scope, and the signal that stops the run
// between pages, for a cancellation or a shutdown.
import type { AppleMusicClient } from "../../apple-music/appleMusicClient.ts";
import type { RunIds } from "../../db/apple-music/syncRuns.ts";
import type { ScopedTransaction } from "../../db/withUserScope.ts";
import type { SyncSettings } from "../config/readServerConfig.ts";

export type SyncTask = {
  readonly ids: RunIds;
  readonly client: AppleMusicClient;
  readonly musicUserToken: string;
  readonly storefront: string;
  readonly settings: SyncSettings;
  readonly signal: AbortSignal;
  readonly inLibrary: <T>(work: (tx: ScopedTransaction) => Promise<T>) => Promise<T>;
};

export type StopReason = "cancelled" | "interrupted";

export class SyncStopped extends Error {
  readonly reason: StopReason;

  constructor(reason: StopReason) {
    super(`sync ${reason}`);
    this.name = "SyncStopped";
    this.reason = reason;
  }
}

export function stopReasonOf(signal: AbortSignal): StopReason {
  return signal.reason === "cancelled" ? "cancelled" : "interrupted";
}

export function stopIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new SyncStopped(stopReasonOf(signal));
}
