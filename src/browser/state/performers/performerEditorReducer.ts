// The performer editor: the performer as last read or saved, and the progress of a change.
import type { PerformerDetail } from "../../../contracts/performers/performerDetailSchema.ts";
import type { PerformerEditorAction } from "./performerEditorActions.ts";

export type PerformerEditorState = {
  readonly status: "idle" | "loading" | "loaded" | "failed";
  readonly performer: PerformerDetail | null;
  readonly failure: string | null;
  readonly saving: boolean;
  readonly saveFailure: string | null;
  readonly confirmingDelete: boolean;
};

export const initialPerformerEditorState: PerformerEditorState = {
  status: "idle",
  performer: null,
  failure: null,
  saving: false,
  saveFailure: null,
  confirmingDelete: false,
};

export function performerEditorReducer(state: PerformerEditorState, action: PerformerEditorAction): PerformerEditorState {
  switch (action.type) {
    case "performer-editor/requested":
      return { ...initialPerformerEditorState, status: "loading" };
    case "performer-editor/loaded":
      return { ...state, status: "loaded", performer: action.performer };
    case "performer-editor/failed":
      return { ...state, status: "failed", failure: action.failure };
    case "performer-editor/save-started":
      return { ...state, saving: true, saveFailure: null };
    case "performer-editor/saved":
      return { ...state, saving: false, performer: action.performer };
    case "performer-editor/save-failed":
      return { ...state, saving: false, saveFailure: action.failure, confirmingDelete: false };
    case "performer-editor/delete-requested":
      return { ...state, confirmingDelete: true };
    case "performer-editor/delete-cancelled":
      return { ...state, confirmingDelete: false };
  }
}

// The name a performer is displayed under.
export function preferredNameOf(performer: PerformerDetail): string {
  return performer.names.find((name) => name.isPreferred)?.name ?? "";
}
