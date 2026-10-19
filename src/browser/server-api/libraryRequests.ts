import type { CreateLibraryRequest } from "../../contracts/libraries/createLibraryRequestSchema.ts";
import type { LibraryListResponse } from "../../contracts/libraries/libraryListResponseSchema.ts";
import type { LibrarySummary } from "../../contracts/libraries/librarySummarySchema.ts";
import { requestJson, type ApiResult } from "./requestJson.ts";

export async function fetchLibraries(): Promise<ApiResult<readonly LibrarySummary[]>> {
  const result = await requestJson<LibraryListResponse>("/api/libraries");
  return result.ok ? { ok: true, value: result.value.libraries } : result;
}

export function postLibrary(label: string): Promise<ApiResult<LibrarySummary>> {
  const body: CreateLibraryRequest = { label };
  return requestJson<LibrarySummary>("/api/libraries", { method: "POST", body });
}
