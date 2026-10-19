// Performer search, paging and creation for one library. A created performer opens in the
// editor.
import { createPerformerRequestOf } from "../../forms/createPerformerRequestOf.ts";
import type { PerformerSummary } from "../../contracts/performers/performerSummarySchema.ts";
import type { Route } from "../../routing/parseRoute.ts";
import { fetchPerformerPage, postPerformer } from "../server-api/performerRequests.ts";
import { useCatalogList, type CatalogListControls, type CatalogListRequests } from "./useCatalogList.ts";

export type PerformerListControls = CatalogListControls<PerformerSummary>;

const performerListRequests: CatalogListRequests<PerformerSummary> = {
  fetchPage: fetchPerformerPage,
  create: (libraryId, values) => postPerformer(libraryId, createPerformerRequestOf(values)),
};

export function usePerformerList(libraryId: string, navigate: (route: Route) => void): PerformerListControls {
  return useCatalogList(libraryId, performerListRequests, (performerId) => navigate({ name: "performer", libraryId, performerId }));
}
