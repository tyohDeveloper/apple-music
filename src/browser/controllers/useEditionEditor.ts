// Loads one edition and applies edits to its details, its track list and its identifiers.
// Deleting an edition returns to its album.
import type { EditionDetail } from "../../contracts/editions/editionDetailSchema.ts";
import type { EditionTrack } from "../../contracts/editions/editionTrackSchema.ts";
import type { RecordingSummary } from "../../contracts/recordings/recordingSummarySchema.ts";
import { updateEditionRequestOf } from "../../forms/updateEditionRequestOf.ts";
import type { Route } from "../../routing/parseRoute.ts";
import * as remote from "../server-api/editionRequests.ts";
import { editionTracksRequestOf } from "../state/tracks/trackListRequests.ts";
import { externalIdAssignmentOf, type ExternalIdAssignmentControls } from "./externalIdAssignmentOf.ts";
import { useCatalogEditor, type CatalogEditorControls, type CatalogEditorRequests } from "./useCatalogEditor.ts";
import { useTrackListDraft, type TrackListDraftControls } from "./useTrackListDraft.ts";
import type { FormValues } from "./formValuesOf.ts";

const editionEditorRequests: CatalogEditorRequests<EditionDetail> = { fetch: remote.fetchEdition, remove: remote.deleteEdition };

export type EditionEditorControls = CatalogEditorControls<EditionDetail> & {
  readonly save: (values: FormValues) => void;
  readonly tracks: TrackListDraftControls<EditionTrack>;
  readonly addTrack: (values: FormValues, choices: readonly RecordingSummary[]) => void;
  readonly saveTracks: () => void;
  readonly externalIds: ExternalIdAssignmentControls;
};

function trackAdder(tracks: TrackListDraftControls<EditionTrack>) {
  return (values: FormValues, choices: readonly RecordingSummary[]): void => {
    const chosen = choices.find((choice) => choice.id === values["recordingId"]);
    const recording = chosen === undefined ? null : { id: chosen.id, title: chosen.title, versionNote: chosen.versionNote, durationMs: chosen.durationMs, creditLine: chosen.creditLine };
    const title = values["title"] ?? "";
    if (title === "" && recording === null) return;
    const discIndex = Number(values["disc"] ?? "0");
    tracks.add(discIndex, { discIndex, position: 0, title: title === "" ? (recording?.title ?? "") : title, inclusion: values["inclusion"] ?? "unknown", recording });
  };
}

export function useEditionEditor(libraryId: string, editionId: string, navigate: (route: Route) => void): EditionEditorControls {
  const onDeleted = (): void => navigate(albumId === null ? { name: "library", libraryId } : { name: "album", libraryId, albumId });
  const editor = useCatalogEditor(libraryId, editionId, editionEditorRequests, () => onDeleted());
  const albumId = editor.state.entity?.album.id ?? null;
  const tracks = useTrackListDraft(editor.state.entity?.tracks ?? null);
  const { apply } = editor;
  return {
    ...editor,
    save: (values) => apply(remote.patchEdition(libraryId, editionId, updateEditionRequestOf(values))),
    tracks,
    addTrack: trackAdder(tracks),
    saveTracks: () => apply(remote.putEditionTracks(libraryId, editionId, editionTracksRequestOf(tracks.state)), (saved) => tracks.reset(saved.tracks)),
    externalIds: externalIdAssignmentOf(editor.state.entity?.externalIds, (externalIds) => apply(remote.putEditionExternalIds(libraryId, editionId, { externalIds }))),
  };
}
