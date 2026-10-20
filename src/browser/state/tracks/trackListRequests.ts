// The replace-tracks requests that would store a track list as being edited. Disc and
// position follow from the order of the discs and of the tracks within them.
import type { AlbumTrack } from "../../../contracts/albums/albumTrackSchema.ts";
import type { ReplaceAlbumTracksRequest } from "../../../contracts/albums/replaceAlbumTracksRequestSchema.ts";
import type { EditionTrack } from "../../../contracts/editions/editionTrackSchema.ts";
import type { ReplaceEditionTracksRequest } from "../../../contracts/editions/replaceEditionTracksRequestSchema.ts";
import type { TrackListDraftState } from "./trackListDraftReducer.ts";

export function albumTracksRequestOf(state: TrackListDraftState<AlbumTrack>): ReplaceAlbumTracksRequest {
  return { discs: state.discs.map((tracks) => ({ tracks: tracks.map((track) => ({ recordingId: track.recording.id, title: track.title, label: track.label })) })) };
}

export function editionTracksRequestOf(state: TrackListDraftState<EditionTrack>): ReplaceEditionTracksRequest {
  return { discs: state.discs.map((tracks) => ({ tracks: tracks.map((track) => ({ title: track.title, inclusion: track.inclusion, recordingId: track.recording?.id ?? null })) })) };
}
