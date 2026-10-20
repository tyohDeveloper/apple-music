import type { SyncRun } from "../../../contracts/apple-music/syncRunSchema.ts";

export type SyncRunAction =
  | { readonly type: "sync/loaded"; readonly run: SyncRun | null }
  | { readonly type: "sync/load-failed"; readonly failure: string }
  | { readonly type: "sync/change-started" }
  | { readonly type: "sync/changed"; readonly run: SyncRun | null }
  | { readonly type: "sync/change-failed"; readonly failure: string };

export const syncLoaded = (run: SyncRun | null): SyncRunAction => ({ type: "sync/loaded", run });
export const syncLoadFailed = (failure: string): SyncRunAction => ({ type: "sync/load-failed", failure });
export const syncChangeStarted = (): SyncRunAction => ({ type: "sync/change-started" });
export const syncChanged = (run: SyncRun | null): SyncRunAction => ({ type: "sync/changed", run });
export const syncChangeFailed = (failure: string): SyncRunAction => ({ type: "sync/change-failed", failure });
