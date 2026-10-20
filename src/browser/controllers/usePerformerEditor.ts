// Loads one performer and applies edits to it, its names, its relations and its genres.
// Every change answers with the performer as it now stands.
import type { PerformerDetail } from "../../contracts/performers/performerDetailSchema.ts";
import { createPerformerNameRequestOf } from "../../forms/createPerformerNameRequestOf.ts";
import { createPerformerRelationRequestOf } from "../../forms/createPerformerRelationRequestOf.ts";
import { updatePerformerRequestOf } from "../../forms/updatePerformerRequestOf.ts";
import type { Route } from "../../routing/parseRoute.ts";
import * as remote from "../server-api/performerRequests.ts";
import { externalIdAssignmentOf, type ExternalIdAssignmentControls } from "./externalIdAssignmentOf.ts";
import { genreAssignmentOf, type GenreAssignmentControls } from "./genreAssignmentOf.ts";
import { useCatalogEditor, type CatalogEditorControls, type CatalogEditorRequests } from "./useCatalogEditor.ts";
import type { FormValues } from "./formValuesOf.ts";

const performerEditorRequests: CatalogEditorRequests<PerformerDetail> = { fetch: remote.fetchPerformer, remove: remote.deletePerformer };

export type PerformerEditorControls = CatalogEditorControls<PerformerDetail> & {
  readonly save: (values: FormValues) => void;
  readonly addName: (values: FormValues) => void;
  readonly preferName: (nameId: string) => void;
  readonly removeName: (nameId: string) => void;
  readonly addRelation: (values: FormValues) => void;
  readonly removeRelation: (relationId: string) => void;
  readonly genres: GenreAssignmentControls;
  readonly externalIds: ExternalIdAssignmentControls;
};

export function usePerformerEditor(libraryId: string, performerId: string, navigate: (route: Route) => void): PerformerEditorControls {
  const editor = useCatalogEditor(libraryId, performerId, performerEditorRequests, () => navigate({ name: "performers", libraryId }));
  const { apply } = editor;
  return {
    ...editor,
    save: (values) => apply(remote.patchPerformer(libraryId, performerId, updatePerformerRequestOf(values))),
    addName: (values) => apply(remote.postPerformerName(libraryId, performerId, createPerformerNameRequestOf(values))),
    preferName: (nameId) => apply(remote.patchPerformerName(libraryId, performerId, nameId, { isPreferred: true })),
    removeName: (nameId) => apply(remote.deletePerformerName(libraryId, performerId, nameId)),
    addRelation: (values) => apply(remote.postPerformerRelation(libraryId, performerId, createPerformerRelationRequestOf(values))),
    removeRelation: (relationId) => apply(remote.deletePerformerRelation(libraryId, performerId, relationId)),
    genres: genreAssignmentOf(editor.state.entity?.genres, (genreIds) => apply(remote.putPerformerGenres(libraryId, performerId, { genreIds }))),
    externalIds: externalIdAssignmentOf("performer", editor.state.entity?.externalIds, (externalIds, onSaved) => apply(remote.putPerformerExternalIds(libraryId, performerId, { externalIds }), onSaved)),
  };
}
