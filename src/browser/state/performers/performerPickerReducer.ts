// Choosing another performer, as for a relation: the results of the last search.
import type { PerformerSummary } from "../../../contracts/performers/performerSummarySchema.ts";
import type { PerformerPickerAction } from "./performerPickerActions.ts";

export type PerformerPickerState = {
  readonly status: "idle" | "loading" | "loaded" | "failed";
  readonly results: readonly PerformerSummary[];
  readonly failure: string | null;
};

export const initialPerformerPickerState: PerformerPickerState = { status: "idle", results: [], failure: null };

export function performerPickerReducer(state: PerformerPickerState, action: PerformerPickerAction): PerformerPickerState {
  switch (action.type) {
    case "performer-picker/requested":
      return { ...state, status: "loading", failure: null };
    case "performer-picker/loaded":
      return { status: "loaded", results: action.results, failure: null };
    case "performer-picker/failed":
      return { ...state, status: "failed", failure: action.failure };
  }
}
