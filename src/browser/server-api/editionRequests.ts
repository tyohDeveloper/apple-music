// Requests for editions, their track lists and identifiers (docs/design/catalog.md).
import type { CreateEditionRequest } from "../../contracts/editions/createEditionRequestSchema.ts";
import type { EditionDetail } from "../../contracts/editions/editionDetailSchema.ts";
import type { ReplaceEditionTracksRequest } from "../../contracts/editions/replaceEditionTracksRequestSchema.ts";
import type { UpdateEditionRequest } from "../../contracts/editions/updateEditionRequestSchema.ts";
import type { ReplaceExternalIdsRequest } from "../../contracts/identifiers/replaceExternalIdsRequestSchema.ts";
import { requestJson, type ApiResult } from "./requestJson.ts";

const edition = (libraryId: string, editionId: string): string => `/api/libraries/${libraryId}/editions/${editionId}`;

export function postEdition(libraryId: string, albumId: string, body: CreateEditionRequest): Promise<ApiResult<EditionDetail>> {
  return requestJson<EditionDetail>(`/api/libraries/${libraryId}/albums/${albumId}/editions`, { method: "POST", body });
}

export function fetchEdition(libraryId: string, editionId: string): Promise<ApiResult<EditionDetail>> {
  return requestJson<EditionDetail>(edition(libraryId, editionId));
}

export function patchEdition(libraryId: string, editionId: string, body: UpdateEditionRequest): Promise<ApiResult<EditionDetail>> {
  return requestJson<EditionDetail>(edition(libraryId, editionId), { method: "PATCH", body });
}

export function deleteEdition(libraryId: string, editionId: string): Promise<ApiResult<unknown>> {
  return requestJson(edition(libraryId, editionId), { method: "DELETE" });
}

export function putEditionTracks(libraryId: string, editionId: string, body: ReplaceEditionTracksRequest): Promise<ApiResult<EditionDetail>> {
  return requestJson<EditionDetail>(`${edition(libraryId, editionId)}/tracks`, { method: "PUT", body });
}

export function putEditionExternalIds(libraryId: string, editionId: string, body: ReplaceExternalIdsRequest): Promise<ApiResult<EditionDetail>> {
  return requestJson<EditionDetail>(`${edition(libraryId, editionId)}/external-ids`, { method: "PUT", body });
}
