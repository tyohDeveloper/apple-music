// One page of a catalog list: GET {path}?query&offset&limit (docs/design/catalog.md).
import type { CatalogPage } from "../../contracts/catalog/catalogPage.ts";
import { requestJson, type ApiResult } from "./requestJson.ts";

export const catalogPageSize = 25;

export function fetchCatalogPage<T>(path: string, query: string, offset: number, filters: Readonly<Record<string, string>> = {}): Promise<ApiResult<CatalogPage<T>>> {
  const search = new URLSearchParams({ ...filters, query, offset: String(offset), limit: String(catalogPageSize) });
  return requestJson<CatalogPage<T>>(`${path}?${search.toString()}`);
}
