// Reading a library from Apple Music: the latest sync run as last loaded or polled, and a
// start or cancel in progress or failed.
import type { SyncRun } from "../../../contracts/apple-music/syncRunSchema.ts";
import type { SyncRunAction } from "./syncRunActions.ts";

export type SyncRunState = {
  readonly status: "loading" | "ready" | "failed";
  readonly run: SyncRun | null;
  readonly changing: boolean;
  readonly failure: string | null;
};

export const initialSyncRunState: SyncRunState = { status: "loading", run: null, changing: false, failure: null };

export function syncRunReducer(state: SyncRunState, action: SyncRunAction): SyncRunState {
  switch (action.type) {
    case "sync/loaded":
      return { ...state, status: "ready", run: action.run };
    case "sync/load-failed":
      return { ...state, status: "failed", failure: action.failure };
    case "sync/change-started":
      return { ...state, changing: true, failure: null };
    case "sync/changed":
      return { ...state, status: "ready", changing: false, run: action.run };
    case "sync/change-failed":
      return { ...state, changing: false, failure: action.failure };
  }
}
