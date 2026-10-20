// A library's sync runs (docs/design/apple-music-import.md, slice H): the latest one,
// starting one, and cancelling the running one.
import type { LatestSyncRun } from "../../contracts/apple-music/latestSyncRunSchema.ts";
import type { StartSyncRunRequest } from "../../contracts/apple-music/startSyncRunRequestSchema.ts";
import { requestJson, type ApiResult } from "./requestJson.ts";

const runsPath = (libraryId: string) => `/api/libraries/${encodeURIComponent(libraryId)}/apple-music/sync-runs`;

export function fetchLatestSyncRun(libraryId: string): Promise<ApiResult<LatestSyncRun>> {
  return requestJson<LatestSyncRun>(`${runsPath(libraryId)}/latest`);
}

export function postSyncRun(libraryId: string, body: StartSyncRunRequest): Promise<ApiResult<LatestSyncRun>> {
  return requestJson<LatestSyncRun>(runsPath(libraryId), { method: "POST", body });
}

export function postSyncRunCancel(libraryId: string, runId: string): Promise<ApiResult<null>> {
  return requestJson<null>(`${runsPath(libraryId)}/${encodeURIComponent(runId)}/cancel`, { method: "POST" });
}
