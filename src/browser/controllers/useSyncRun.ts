// A library's sync runs (docs/design/apple-music-import.md, slice H): loads the latest run
// once the library is connected, polls it every two seconds while it runs, starts a run
// (replacing the mirror when the owner asks) and cancels the running one.
import { useCallback, useEffect, useReducer } from "preact/hooks";
import type { SyncRun } from "../../contracts/apple-music/syncRunSchema.ts";
import { fetchLatestSyncRun, postSyncRun, postSyncRunCancel } from "../server-api/syncRunRequests.ts";
import { syncChanged, syncChangeFailed, syncChangeStarted, syncLoaded, syncLoadFailed, type SyncRunAction } from "../state/apple-music/syncRunActions.ts";
import { initialSyncRunState, syncRunReducer, type SyncRunState } from "../state/apple-music/syncRunReducer.ts";

export type SyncRunControls = {
  readonly state: SyncRunState;
  readonly start: (replaceMirror: boolean) => void;
  readonly cancel: () => void;
};

type Dispatch = (action: SyncRunAction) => void;

const pollMs = 2000;

async function latestAction(libraryId: string, changed: boolean): Promise<SyncRunAction> {
  const result = await fetchLatestSyncRun(libraryId);
  if (!result.ok) return changed ? syncChangeFailed(result.code) : syncLoadFailed(result.code);
  return changed ? syncChanged(result.value.run) : syncLoaded(result.value.run);
}

function usePolledRun(libraryId: string, connected: boolean, run: SyncRun | null, dispatch: Dispatch): void {
  useEffect(() => {
    if (connected) void latestAction(libraryId, false).then(dispatch);
  }, [libraryId, connected, dispatch]);
  useEffect(() => {
    if (run?.status !== "running") return undefined;
    const timer = setTimeout(() => void latestAction(libraryId, false).then(dispatch), pollMs);
    return () => clearTimeout(timer);
  }, [libraryId, run, dispatch]);
}

export function useSyncRun(libraryId: string, connected: boolean): SyncRunControls {
  const [state, dispatch] = useReducer(syncRunReducer, initialSyncRunState);
  usePolledRun(libraryId, connected, state.run, dispatch);
  const start = useCallback((replaceMirror: boolean) => {
    dispatch(syncChangeStarted());
    void postSyncRun(libraryId, { replaceMirror }).then((result) => dispatch(result.ok ? syncChanged(result.value.run) : syncChangeFailed(result.code)));
  }, [libraryId]);
  const runId = state.run?.id ?? null;
  const cancel = useCallback(() => {
    if (runId === null) return;
    dispatch(syncChangeStarted());
    void postSyncRunCancel(libraryId, runId).then(async (result) => dispatch(result.ok ? await latestAction(libraryId, true) : syncChangeFailed(result.code)));
  }, [libraryId, runId]);
  return { state, start, cancel };
}
