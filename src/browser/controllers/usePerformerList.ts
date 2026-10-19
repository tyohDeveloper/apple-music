// Performer search, paging and creation for one library. A created performer opens in the
// editor.
import { useCallback, useEffect, useReducer } from "preact/hooks";
import { createPerformerRequestOf } from "../../forms/createPerformerRequestOf.ts";
import type { Route } from "../../routing/parseRoute.ts";
import { fetchPerformerPage, performerPageSize, postPerformer } from "../server-api/performerRequests.ts";
import {
  performerCreated,
  performerCreateFailed,
  performerCreateStarted,
  performerListFailed,
  performerListLoaded,
  performerListRequested,
} from "../state/performers/performerListActions.ts";
import { initialPerformerListState, performerListReducer, type PerformerListState } from "../state/performers/performerListReducer.ts";
import type { FormValues } from "./formValuesOf.ts";

export type PerformerListControls = {
  readonly state: PerformerListState;
  readonly search: (values: FormValues) => void;
  readonly showPrevious: () => void;
  readonly showNext: () => void;
  readonly create: (values: FormValues) => void;
};

export function usePerformerList(libraryId: string, navigate: (route: Route) => void): PerformerListControls {
  const [state, dispatch] = useReducer(performerListReducer, initialPerformerListState);
  const load = useCallback((query: string, offset: number) => {
    dispatch(performerListRequested(query, offset));
    void fetchPerformerPage(libraryId, query, offset).then((result) => dispatch(result.ok ? performerListLoaded(result.value) : performerListFailed(result.code)));
  }, [libraryId]);
  useEffect(() => load("", 0), [load]);
  const create = useCallback((values: FormValues) => {
    dispatch(performerCreateStarted());
    void postPerformer(libraryId, createPerformerRequestOf(values)).then((result) => {
      dispatch(result.ok ? performerCreated() : performerCreateFailed(result.code));
      if (result.ok) navigate({ name: "performer", libraryId, performerId: result.value.id });
    });
  }, [libraryId, navigate]);
  const showPrevious = (): void => load(state.query, Math.max(0, state.offset - performerPageSize));
  const showNext = (): void => load(state.query, state.offset + performerPageSize);
  return { state, search: (values) => load((values["query"] ?? "").trim(), 0), showPrevious, showNext, create };
}
