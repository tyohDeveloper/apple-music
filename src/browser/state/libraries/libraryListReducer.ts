import type { LibrarySummary } from "../../../contracts/libraries/librarySummarySchema.ts";
import type { LibraryListAction } from "./libraryListActions.ts";

export type LibraryListState = {
  readonly status: "idle" | "loading" | "loaded" | "failed";
  readonly libraries: readonly LibrarySummary[];
  readonly failure: string | null;
  readonly creating: boolean;
  readonly createFailure: string | null;
};

export const initialLibraryListState: LibraryListState = {
  status: "idle",
  libraries: [],
  failure: null,
  creating: false,
  createFailure: null,
};

export function libraryListReducer(state: LibraryListState, action: LibraryListAction): LibraryListState {
  switch (action.type) {
    case "libraries/requested":
      return { ...state, status: "loading", failure: null };
    case "libraries/loaded":
      return { ...state, status: "loaded", libraries: action.libraries };
    case "libraries/failed":
      return { ...state, status: "failed", failure: action.failure };
    case "libraries/create-started":
      return { ...state, creating: true, createFailure: null };
    case "libraries/created":
      return { ...state, creating: false, libraries: [...state.libraries, action.library] };
    case "libraries/create-failed":
      return { ...state, creating: false, createFailure: action.failure };
  }
}
