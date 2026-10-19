import type { PerformerPage } from "../../../contracts/performers/performerPageSchema.ts";

export type PerformerListAction =
  | { readonly type: "performer-list/requested"; readonly query: string; readonly offset: number }
  | { readonly type: "performer-list/loaded"; readonly page: PerformerPage }
  | { readonly type: "performer-list/failed"; readonly failure: string }
  | { readonly type: "performer-list/create-started" }
  | { readonly type: "performer-list/create-failed"; readonly failure: string }
  | { readonly type: "performer-list/created" };

export const performerListRequested = (query: string, offset: number): PerformerListAction => ({
  type: "performer-list/requested",
  query,
  offset,
});
export const performerListLoaded = (page: PerformerPage): PerformerListAction => ({ type: "performer-list/loaded", page });
export const performerListFailed = (failure: string): PerformerListAction => ({ type: "performer-list/failed", failure });
export const performerCreateStarted = (): PerformerListAction => ({ type: "performer-list/create-started" });
export const performerCreateFailed = (failure: string): PerformerListAction => ({ type: "performer-list/create-failed", failure });
export const performerCreated = (): PerformerListAction => ({ type: "performer-list/created" });
