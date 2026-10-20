import { describe, expect, it } from "vitest";
import type { SyncRun } from "../../../../../src/contracts/apple-music/syncRunSchema.ts";
import { syncChanged, syncChangeFailed, syncChangeStarted, syncLoaded, syncLoadFailed } from "../../../../../src/browser/state/apple-music/syncRunActions.ts";
import { initialSyncRunState, syncRunReducer } from "../../../../../src/browser/state/apple-music/syncRunReducer.ts";

const counts = { songs: 2, albums: 1, artists: 1, playlists: 0, catalogSongs: 0, catalogAlbums: 0, added: 0, changed: 0, removed: 0 };
const running: SyncRun = { id: "8d4c2c0e-6a55-4f1b-9d0e-2b8f6f1a3c10", status: "running", phase: "songs", replaceMirror: false, startedAt: "2026-10-19T21:00:00.000Z", finishedAt: null, errorCode: null, counts };
const succeeded: SyncRun = { ...running, status: "succeeded", phase: "removals", finishedAt: "2026-10-19T21:02:00.000Z" };

describe("syncRunReducer", () => {
  it("sync/loaded stores the latest run, or none", () => {
    expect(syncRunReducer(initialSyncRunState, syncLoaded(null))).toMatchObject({ status: "ready", run: null });
    expect(syncRunReducer(initialSyncRunState, syncLoaded(running))).toMatchObject({ status: "ready", run: running });
  });
  it("sync/load-failed records the failure", () => {
    expect(syncRunReducer(initialSyncRunState, syncLoadFailed("network"))).toMatchObject({ status: "failed", failure: "network" });
  });
  it("sync/change-started marks a change in progress and clears an earlier failure", () => {
    const failed = syncRunReducer(initialSyncRunState, syncChangeFailed("sync-already-running"));
    expect(syncRunReducer(failed, syncChangeStarted())).toMatchObject({ changing: true, failure: null });
  });
  it("sync/changed stores the run a start or cancel produced", () => {
    const changing = syncRunReducer(syncRunReducer(initialSyncRunState, syncLoaded(succeeded)), syncChangeStarted());
    expect(syncRunReducer(changing, syncChanged(running))).toMatchObject({ status: "ready", changing: false, run: running });
  });
  it("sync/change-failed keeps the run and records the failure", () => {
    const changing = syncRunReducer(syncRunReducer(initialSyncRunState, syncLoaded(succeeded)), syncChangeStarted());
    expect(syncRunReducer(changing, syncChangeFailed("rate-limited"))).toMatchObject({ changing: false, run: succeeded, failure: "rate-limited" });
  });
});
