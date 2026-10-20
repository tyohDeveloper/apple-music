// Requests for recordings and their credits (docs/design/catalog.md, slice B).
import type { CatalogPage } from "../../contracts/catalog/catalogPage.ts";
import type { ReplaceCreditsRequest } from "../../contracts/credits/replaceCreditsRequestSchema.ts";
import type { CreateRecordingRequest } from "../../contracts/recordings/createRecordingRequestSchema.ts";
import type { RecordingDetail } from "../../contracts/recordings/recordingDetailSchema.ts";
import type { RecordingSummary } from "../../contracts/recordings/recordingSummarySchema.ts";
import type { UpdateRecordingRequest } from "../../contracts/recordings/updateRecordingRequestSchema.ts";
import { fetchCatalogPage } from "./catalogPageRequest.ts";
import { requestJson, type ApiResult } from "./requestJson.ts";

const recordings = (libraryId: string): string => `/api/libraries/${libraryId}/recordings`;
const recording = (libraryId: string, recordingId: string): string => `${recordings(libraryId)}/${recordingId}`;

export function fetchRecordingPage(libraryId: string, query: string, offset: number): Promise<ApiResult<CatalogPage<RecordingSummary>>> {
  return fetchCatalogPage<RecordingSummary>(recordings(libraryId), query, offset);
}

export type RecordingFilter = { readonly performerId: string };

export function fetchLinkedRecordingPage(libraryId: string, filter: RecordingFilter, offset: number): Promise<ApiResult<CatalogPage<RecordingSummary>>> {
  return fetchCatalogPage<RecordingSummary>(recordings(libraryId), "", offset, filter);
}

export function postRecording(libraryId: string, body: CreateRecordingRequest): Promise<ApiResult<RecordingDetail>> {
  return requestJson<RecordingDetail>(recordings(libraryId), { method: "POST", body });
}

export function fetchRecording(libraryId: string, recordingId: string): Promise<ApiResult<RecordingDetail>> {
  return requestJson<RecordingDetail>(recording(libraryId, recordingId));
}

export function patchRecording(libraryId: string, recordingId: string, body: UpdateRecordingRequest): Promise<ApiResult<RecordingDetail>> {
  return requestJson<RecordingDetail>(recording(libraryId, recordingId), { method: "PATCH", body });
}

export function deleteRecording(libraryId: string, recordingId: string): Promise<ApiResult<unknown>> {
  return requestJson(recording(libraryId, recordingId), { method: "DELETE" });
}

export function putRecordingCredits(libraryId: string, recordingId: string, body: ReplaceCreditsRequest): Promise<ApiResult<RecordingDetail>> {
  return requestJson<RecordingDetail>(`${recording(libraryId, recordingId)}/credits`, { method: "PUT", body });
}
