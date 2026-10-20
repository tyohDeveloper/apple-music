// Loads one album and applies edits to its details, credits and intended track list, and
// creates its editions. Saved lists become the clean drafts.
import type { AlbumDetail } from "../../contracts/albums/albumDetailSchema.ts";
import type { AlbumTrack } from "../../contracts/albums/albumTrackSchema.ts";
import type { RecordingSummary } from "../../contracts/recordings/recordingSummarySchema.ts";
import { createEditionRequestOf } from "../../forms/createEditionRequestOf.ts";
import { updateAlbumRequestOf } from "../../forms/updateAlbumRequestOf.ts";
import type { Route } from "../../routing/parseRoute.ts";
import * as remote from "../server-api/albumRequests.ts";
import { postEdition } from "../server-api/editionRequests.ts";
import { replaceCreditsRequestOf } from "../state/credits/creditDraftReducer.ts";
import { albumTracksRequestOf } from "../state/tracks/trackListRequests.ts";
import { useCatalogEditor, type CatalogEditorControls, type CatalogEditorRequests } from "./useCatalogEditor.ts";
import { useCreditDraft, type CreditDraftControls } from "./useCreditDraft.ts";
import { useTrackListDraft, type TrackListDraftControls } from "./useTrackListDraft.ts";
import type { FormValues } from "./formValuesOf.ts";

const albumEditorRequests: CatalogEditorRequests<AlbumDetail> = { fetch: remote.fetchAlbum, remove: remote.deleteAlbum };

export type AlbumEditorControls = CatalogEditorControls<AlbumDetail> & {
  readonly save: (values: FormValues) => void;
  readonly credits: CreditDraftControls;
  readonly saveCredits: () => void;
  readonly tracks: TrackListDraftControls<AlbumTrack>;
  readonly addTrack: (values: FormValues, choices: readonly RecordingSummary[]) => void;
  readonly saveTracks: () => void;
  readonly createEdition: (values: FormValues) => void;
};

function trackAdder(tracks: TrackListDraftControls<AlbumTrack>) {
  return (values: FormValues, choices: readonly RecordingSummary[]): void => {
    const chosen = choices.find((choice) => choice.id === values["recordingId"]);
    if (chosen === undefined) return;
    const { id, title, versionNote, durationMs, creditLine } = chosen;
    const discIndex = Number(values["disc"] ?? "0");
    tracks.add(discIndex, { discIndex, position: 0, title: null, label: null, recording: { id, title, versionNote, durationMs, creditLine } });
  };
}

export function useAlbumEditor(libraryId: string, albumId: string, navigate: (route: Route) => void): AlbumEditorControls {
  const editor = useCatalogEditor(libraryId, albumId, albumEditorRequests, () => navigate({ name: "albums", libraryId }));
  const credits = useCreditDraft(libraryId, editor.state.entity?.credits ?? null);
  const tracks = useTrackListDraft(editor.state.entity?.tracks ?? null);
  const { apply } = editor;
  const createEdition = (values: FormValues): void => {
    void postEdition(libraryId, albumId, createEditionRequestOf(values)).then((result) => {
      if (result.ok) navigate({ name: "edition", libraryId, editionId: result.value.id });
      else editor.refuse(result.code);
    });
  };
  return {
    ...editor,
    save: (values) => apply(remote.patchAlbum(libraryId, albumId, updateAlbumRequestOf(values))),
    credits,
    saveCredits: () => apply(remote.putAlbumCredits(libraryId, albumId, replaceCreditsRequestOf(credits.state)), (saved) => credits.reset(saved.credits)),
    tracks,
    addTrack: trackAdder(tracks),
    saveTracks: () => apply(remote.putAlbumTracks(libraryId, albumId, albumTracksRequestOf(tracks.state)), (saved) => tracks.reset(saved.tracks)),
    createEdition,
  };
}
