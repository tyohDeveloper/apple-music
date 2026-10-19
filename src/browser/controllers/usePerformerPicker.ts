// Searches the library's performers so the user can choose one, as the other side of a relation.
import { useCallback, useReducer } from "preact/hooks";
import { fetchPerformerPage } from "../server-api/performerRequests.ts";
import { pickerFailed, pickerLoaded, pickerRequested } from "../state/performers/performerPickerActions.ts";
import { initialPerformerPickerState, performerPickerReducer, type PerformerPickerState } from "../state/performers/performerPickerReducer.ts";

import type { FormValues } from "./formValuesOf.ts";

export type PerformerPickerControls = { readonly state: PerformerPickerState; readonly search: (values: FormValues) => void };

export function usePerformerPicker(libraryId: string): PerformerPickerControls {
  const [state, dispatch] = useReducer(performerPickerReducer, initialPerformerPickerState);
  const search = useCallback((values: FormValues) => {
    dispatch(pickerRequested());
    void fetchPerformerPage(libraryId, (values["query"] ?? "").trim(), 0).then((result) => dispatch(result.ok ? pickerLoaded(result.value.items) : pickerFailed(result.code)));
  }, [libraryId]);
  return { state, search };
}
