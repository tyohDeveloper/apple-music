// The performer search screen: the current search, one page of results, and creation.
import type { PerformerSummary } from "../../../contracts/performers/performerSummarySchema.ts";
import type { PerformerListAction } from "./performerListActions.ts";

export type PerformerListState = {
  readonly status: "idle" | "loading" | "loaded" | "failed";
  readonly query: string;
  readonly offset: number;
  readonly items: readonly PerformerSummary[];
  readonly total: number;
  readonly failure: string | null;
  readonly creating: boolean;
  readonly createFailure: string | null;
};

export type PageRange = { readonly from: number; readonly to: number; readonly total: number; readonly hasPrevious: boolean; readonly hasNext: boolean };

export const initialPerformerListState: PerformerListState = {
  status: "idle",
  query: "",
  offset: 0,
  items: [],
  total: 0,
  failure: null,
  creating: false,
  createFailure: null,
};

export function performerListReducer(state: PerformerListState, action: PerformerListAction): PerformerListState {
  switch (action.type) {
    case "performer-list/requested":
      return { ...state, status: "loading", query: action.query, offset: action.offset, failure: null };
    case "performer-list/loaded":
      return { ...state, status: "loaded", items: action.page.items, total: action.page.total };
    case "performer-list/failed":
      return { ...state, status: "failed", failure: action.failure };
    case "performer-list/create-started":
      return { ...state, creating: true, createFailure: null };
    case "performer-list/create-failed":
      return { ...state, creating: false, createFailure: action.failure };
    case "performer-list/created":
      return { ...state, creating: false };
  }
}

// The 1-based range of results on screen, for "1–25 of 340" and the paging buttons.
export function pageRangeOf(state: PerformerListState): PageRange {
  const to = state.offset + state.items.length;
  return { from: state.items.length === 0 ? 0 : state.offset + 1, to, total: state.total, hasPrevious: state.offset > 0, hasNext: to < state.total };
}
