// Loads the signed-in user's libraries and creates new ones.
import { useCallback, useEffect, useReducer } from "preact/hooks";
import { fetchLibraries, postLibrary } from "../server-api/libraryRequests.ts";
import {
  libraryCreated,
  libraryCreateFailed,
  libraryCreateStarted,
  librariesFailed,
  librariesLoaded,
  librariesRequested,
} from "../state/libraries/libraryListActions.ts";
import { initialLibraryListState, libraryListReducer, type LibraryListState } from "../state/libraries/libraryListReducer.ts";

export type LibraryControls = { readonly state: LibraryListState; readonly create: (label: string) => void };

export function useLibraries(active: boolean): LibraryControls {
  const [state, dispatch] = useReducer(libraryListReducer, initialLibraryListState);
  useEffect(() => {
    if (!active) return;
    dispatch(librariesRequested());
    void fetchLibraries().then((result) => dispatch(result.ok ? librariesLoaded(result.value) : librariesFailed(result.code)));
  }, [active]);
  const create = useCallback((label: string) => {
    dispatch(libraryCreateStarted());
    void postLibrary(label).then((result) => dispatch(result.ok ? libraryCreated(result.value) : libraryCreateFailed(result.code)));
  }, []);
  return { state, create };
}
