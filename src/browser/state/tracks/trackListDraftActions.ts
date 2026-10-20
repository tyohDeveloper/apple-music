// Actions on a track list being edited, disc by disc: an album's intended track list or an
// edition's tracks. The list is saved whole (ADR-0009); adding to the disc after the last
// starts a new disc, and removing a disc's last track removes the disc.
export type TrackListDraftAction<T> =
  | { readonly type: "track-list-draft/reset"; readonly discs: readonly (readonly T[])[] }
  | { readonly type: "track-list-draft/added"; readonly discIndex: number; readonly track: T }
  | { readonly type: "track-list-draft/removed"; readonly discIndex: number; readonly position: number }
  | { readonly type: "track-list-draft/moved"; readonly discIndex: number; readonly position: number; readonly offset: -1 | 1 }
  | { readonly type: "track-list-draft/changed"; readonly discIndex: number; readonly position: number; readonly change: Partial<T> };

export const tracksReset = <T>(discs: readonly (readonly T[])[]): TrackListDraftAction<T> => ({ type: "track-list-draft/reset", discs });
export const trackAdded = <T>(discIndex: number, track: T): TrackListDraftAction<T> => ({ type: "track-list-draft/added", discIndex, track });
export const trackRemoved = (discIndex: number, position: number): TrackListDraftAction<never> => ({ type: "track-list-draft/removed", discIndex, position });
export const trackMoved = (discIndex: number, position: number, offset: -1 | 1): TrackListDraftAction<never> => ({ type: "track-list-draft/moved", discIndex, position, offset });
export const trackChanged = <T>(discIndex: number, position: number, change: Partial<T>): TrackListDraftAction<T> => ({ type: "track-list-draft/changed", discIndex, position, change });
