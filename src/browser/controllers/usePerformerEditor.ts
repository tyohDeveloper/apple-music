// Loads one performer and applies edits to it, its names and its relations. Every change
// answers with the performer as it now stands.
import { useEffect, useMemo, useReducer } from "preact/hooks";
import type { PerformerDetail } from "../../contracts/performers/performerDetailSchema.ts";
import { createPerformerNameRequestOf } from "../../forms/createPerformerNameRequestOf.ts";
import { createPerformerRelationRequestOf } from "../../forms/createPerformerRelationRequestOf.ts";
import { updatePerformerRequestOf } from "../../forms/updatePerformerRequestOf.ts";
import type { Route } from "../../routing/parseRoute.ts";
import * as remote from "../server-api/performerRequests.ts";
import type { ApiResult } from "../server-api/requestJson.ts";
import * as actions from "../state/performers/performerEditorActions.ts";
import { initialPerformerEditorState, performerEditorReducer, type PerformerEditorState } from "../state/performers/performerEditorReducer.ts";
import type { FormValues } from "./formValuesOf.ts";

type Dispatch = (action: actions.PerformerEditorAction) => void;
export type PerformerEditorControls = ReturnType<typeof editorControls> & { readonly state: PerformerEditorState };

function deleteControl(libraryId: string, performerId: string, dispatch: Dispatch, navigate: (route: Route) => void) {
  return () => {
    dispatch(actions.performerSaveStarted());
    void remote.deletePerformer(libraryId, performerId).then((result) => {
      if (result.ok) navigate({ name: "performers", libraryId });
      else dispatch(actions.performerSaveFailed(result.code));
    });
  };
}

function editorControls(libraryId: string, performerId: string, dispatch: Dispatch, navigate: (route: Route) => void) {
  const apply = (request: Promise<ApiResult<PerformerDetail>>): void => {
    dispatch(actions.performerSaveStarted());
    void request.then((result) => dispatch(result.ok ? actions.performerSaved(result.value) : actions.performerSaveFailed(result.code)));
  };
  return {
    save: (values: FormValues) => apply(remote.patchPerformer(libraryId, performerId, updatePerformerRequestOf(values))),
    addName: (values: FormValues) => apply(remote.postPerformerName(libraryId, performerId, createPerformerNameRequestOf(values))),
    preferName: (nameId: string) => apply(remote.patchPerformerName(libraryId, performerId, nameId, { isPreferred: true })),
    removeName: (nameId: string) => apply(remote.deletePerformerName(libraryId, performerId, nameId)),
    addRelation: (values: FormValues) => apply(remote.postPerformerRelation(libraryId, performerId, createPerformerRelationRequestOf(values))),
    removeRelation: (relationId: string) => apply(remote.deletePerformerRelation(libraryId, performerId, relationId)),
    requestDelete: () => dispatch(actions.performerDeleteRequested()),
    cancelDelete: () => dispatch(actions.performerDeleteCancelled()),
    confirmDelete: deleteControl(libraryId, performerId, dispatch, navigate),
  };
}

export function usePerformerEditor(libraryId: string, performerId: string, navigate: (route: Route) => void): PerformerEditorControls {
  const [state, dispatch] = useReducer(performerEditorReducer, initialPerformerEditorState);
  useEffect(() => {
    dispatch(actions.performerRequested());
    void remote.fetchPerformer(libraryId, performerId).then((result) => dispatch(result.ok ? actions.performerLoaded(result.value) : actions.performerFailed(result.code)));
  }, [libraryId, performerId]);
  const controls = useMemo(() => editorControls(libraryId, performerId, dispatch, navigate), [libraryId, performerId, navigate]);
  return { state, ...controls };
}
