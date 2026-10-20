// Requests for performers, their names, relations and genres (docs/design/catalog.md).
import type { CatalogPage } from "../../contracts/catalog/catalogPage.ts";
import type { ReplaceGenresRequest } from "../../contracts/genres/replaceGenresRequestSchema.ts";
import type { CreatePerformerNameRequest } from "../../contracts/performers/createPerformerNameRequestSchema.ts";
import type { CreatePerformerRelationRequest } from "../../contracts/performers/createPerformerRelationRequestSchema.ts";
import type { CreatePerformerRequest } from "../../contracts/performers/createPerformerRequestSchema.ts";
import type { PerformerDetail } from "../../contracts/performers/performerDetailSchema.ts";
import type { PerformerSummary } from "../../contracts/performers/performerSummarySchema.ts";
import type { UpdatePerformerNameRequest } from "../../contracts/performers/updatePerformerNameRequestSchema.ts";
import type { UpdatePerformerRequest } from "../../contracts/performers/updatePerformerRequestSchema.ts";
import { fetchCatalogPage } from "./catalogPageRequest.ts";
import { requestJson, type ApiResult } from "./requestJson.ts";

const performers = (libraryId: string): string => `/api/libraries/${libraryId}/performers`;
const performer = (libraryId: string, performerId: string): string => `${performers(libraryId)}/${performerId}`;

export function fetchPerformerPage(libraryId: string, query: string, offset: number): Promise<ApiResult<CatalogPage<PerformerSummary>>> {
  return fetchCatalogPage<PerformerSummary>(performers(libraryId), query, offset);
}

export function fetchLinkedPerformerPage(libraryId: string, filter: { readonly genreId: string }, offset: number): Promise<ApiResult<CatalogPage<PerformerSummary>>> {
  return fetchCatalogPage<PerformerSummary>(performers(libraryId), "", offset, filter);
}

export function postPerformer(libraryId: string, body: CreatePerformerRequest): Promise<ApiResult<PerformerDetail>> {
  return requestJson<PerformerDetail>(performers(libraryId), { method: "POST", body });
}

export function fetchPerformer(libraryId: string, performerId: string): Promise<ApiResult<PerformerDetail>> {
  return requestJson<PerformerDetail>(performer(libraryId, performerId));
}

export function patchPerformer(libraryId: string, performerId: string, body: UpdatePerformerRequest): Promise<ApiResult<PerformerDetail>> {
  return requestJson<PerformerDetail>(performer(libraryId, performerId), { method: "PATCH", body });
}

export function deletePerformer(libraryId: string, performerId: string): Promise<ApiResult<unknown>> {
  return requestJson(performer(libraryId, performerId), { method: "DELETE" });
}

export function postPerformerName(libraryId: string, performerId: string, body: CreatePerformerNameRequest): Promise<ApiResult<PerformerDetail>> {
  return requestJson<PerformerDetail>(`${performer(libraryId, performerId)}/names`, { method: "POST", body });
}

export function patchPerformerName(
  libraryId: string,
  performerId: string,
  nameId: string,
  body: UpdatePerformerNameRequest,
): Promise<ApiResult<PerformerDetail>> {
  return requestJson<PerformerDetail>(`${performer(libraryId, performerId)}/names/${nameId}`, { method: "PATCH", body });
}

export function deletePerformerName(libraryId: string, performerId: string, nameId: string): Promise<ApiResult<PerformerDetail>> {
  return requestJson<PerformerDetail>(`${performer(libraryId, performerId)}/names/${nameId}`, { method: "DELETE" });
}

export function postPerformerRelation(
  libraryId: string,
  performerId: string,
  body: CreatePerformerRelationRequest,
): Promise<ApiResult<PerformerDetail>> {
  return requestJson<PerformerDetail>(`${performer(libraryId, performerId)}/relations`, { method: "POST", body });
}

export function deletePerformerRelation(libraryId: string, performerId: string, relationId: string): Promise<ApiResult<PerformerDetail>> {
  return requestJson<PerformerDetail>(`${performer(libraryId, performerId)}/relations/${relationId}`, { method: "DELETE" });
}

export function putPerformerGenres(libraryId: string, performerId: string, body: ReplaceGenresRequest): Promise<ApiResult<PerformerDetail>> {
  return requestJson<PerformerDetail>(`${performer(libraryId, performerId)}/genres`, { method: "PUT", body });
}
