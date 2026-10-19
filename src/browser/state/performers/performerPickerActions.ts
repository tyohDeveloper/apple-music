import type { PerformerSummary } from "../../../contracts/performers/performerSummarySchema.ts";

export type PerformerPickerAction =
  | { readonly type: "performer-picker/requested" }
  | { readonly type: "performer-picker/loaded"; readonly results: readonly PerformerSummary[] }
  | { readonly type: "performer-picker/failed"; readonly failure: string };

export const pickerRequested = (): PerformerPickerAction => ({ type: "performer-picker/requested" });
export const pickerLoaded = (results: readonly PerformerSummary[]): PerformerPickerAction => ({ type: "performer-picker/loaded", results });
export const pickerFailed = (failure: string): PerformerPickerAction => ({ type: "performer-picker/failed", failure });
