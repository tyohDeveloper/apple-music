import type { PerformerDetail } from "../../../contracts/performers/performerDetailSchema.ts";

export type PerformerEditorAction =
  | { readonly type: "performer-editor/requested" }
  | { readonly type: "performer-editor/loaded"; readonly performer: PerformerDetail }
  | { readonly type: "performer-editor/failed"; readonly failure: string }
  | { readonly type: "performer-editor/save-started" }
  | { readonly type: "performer-editor/saved"; readonly performer: PerformerDetail }
  | { readonly type: "performer-editor/save-failed"; readonly failure: string }
  | { readonly type: "performer-editor/delete-requested" }
  | { readonly type: "performer-editor/delete-cancelled" };

export const performerRequested = (): PerformerEditorAction => ({ type: "performer-editor/requested" });
export const performerLoaded = (performer: PerformerDetail): PerformerEditorAction => ({ type: "performer-editor/loaded", performer });
export const performerFailed = (failure: string): PerformerEditorAction => ({ type: "performer-editor/failed", failure });
export const performerSaveStarted = (): PerformerEditorAction => ({ type: "performer-editor/save-started" });
export const performerSaved = (performer: PerformerDetail): PerformerEditorAction => ({ type: "performer-editor/saved", performer });
export const performerSaveFailed = (failure: string): PerformerEditorAction => ({ type: "performer-editor/save-failed", failure });
export const performerDeleteRequested = (): PerformerEditorAction => ({ type: "performer-editor/delete-requested" });
export const performerDeleteCancelled = (): PerformerEditorAction => ({ type: "performer-editor/delete-cancelled" });
