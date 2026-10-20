// A track list as being edited, disc by disc, and whether it differs from the stored list.
import type { TrackListDraftAction } from "./trackListDraftActions.ts";

export type TrackListDraftState<T> = { readonly discs: readonly (readonly T[])[]; readonly dirty: boolean };

export const initialTrackListDraftState: TrackListDraftState<never> = { discs: [], dirty: false };

type Discs<T> = readonly (readonly T[])[];

function withDisc<T>(discs: Discs<T>, discIndex: number, edit: (tracks: readonly T[]) => readonly T[]): Discs<T> {
  return discs.map((tracks, index) => (index === discIndex ? edit(tracks) : tracks)).filter((tracks) => tracks.length > 0);
}

function swapped<T>(tracks: readonly T[], position: number, offset: -1 | 1): readonly T[] {
  const [track, other] = [tracks[position], tracks[position + offset]];
  if (track === undefined || other === undefined) return tracks;
  return tracks.map((entry, index) => (index === position ? other : index === position + offset ? track : entry));
}

function added<T>(discs: Discs<T>, discIndex: number, track: T): Discs<T> {
  return discIndex >= discs.length ? [...discs, [track]] : withDisc(discs, discIndex, (tracks) => [...tracks, track]);
}

function editedDiscs<T>(discs: Discs<T>, action: Exclude<TrackListDraftAction<T>, { readonly type: "track-list-draft/reset" }>): Discs<T> {
  switch (action.type) {
    case "track-list-draft/added":
      return added(discs, action.discIndex, action.track);
    case "track-list-draft/removed":
      return withDisc(discs, action.discIndex, (tracks) => tracks.filter((_, index) => index !== action.position));
    case "track-list-draft/moved":
      return withDisc(discs, action.discIndex, (tracks) => swapped(tracks, action.position, action.offset));
    case "track-list-draft/changed":
      return withDisc(discs, action.discIndex, (tracks) => tracks.map((track, index) => (index === action.position ? { ...track, ...action.change } : track)));
  }
}

export function trackListDraftReducer<T>(state: TrackListDraftState<T>, action: TrackListDraftAction<T>): TrackListDraftState<T> {
  if (action.type === "track-list-draft/reset") return { discs: action.discs, dirty: false };
  return { discs: editedDiscs(state.discs, action), dirty: true };
}
