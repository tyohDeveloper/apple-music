import type { LibrarySummary } from "../../../contracts/libraries/librarySummarySchema.ts";

export type LibraryListAction =
  | { readonly type: "libraries/requested" }
  | { readonly type: "libraries/loaded"; readonly libraries: readonly LibrarySummary[] }
  | { readonly type: "libraries/failed"; readonly failure: string }
  | { readonly type: "libraries/create-started" }
  | { readonly type: "libraries/created"; readonly library: LibrarySummary }
  | { readonly type: "libraries/create-failed"; readonly failure: string };

export const librariesRequested = (): LibraryListAction => ({ type: "libraries/requested" });
export const librariesLoaded = (libraries: readonly LibrarySummary[]): LibraryListAction => ({
  type: "libraries/loaded",
  libraries,
});
export const librariesFailed = (failure: string): LibraryListAction => ({ type: "libraries/failed", failure });
export const libraryCreateStarted = (): LibraryListAction => ({ type: "libraries/create-started" });
export const libraryCreated = (library: LibrarySummary): LibraryListAction => ({ type: "libraries/created", library });
export const libraryCreateFailed = (failure: string): LibraryListAction => ({
  type: "libraries/create-failed",
  failure,
});
