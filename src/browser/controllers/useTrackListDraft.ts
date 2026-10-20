// A track list being edited beside an album or edition editor. It follows the stored list
// until the user changes it, and again once the change is saved or discarded.
import { useEffect, useReducer } from "preact/hooks";
import { discsOf } from "../../editions/discsOf.ts";
import * as actions from "../state/tracks/trackListDraftActions.ts";
import { initialTrackListDraftState, trackListDraftReducer, type TrackListDraftState } from "../state/tracks/trackListDraftReducer.ts";

export type TrackListDraftControls<T> = {
  readonly state: TrackListDraftState<T>;
  readonly add: (discIndex: number, track: T) => void;
  readonly remove: (discIndex: number, position: number) => void;
  readonly move: (discIndex: number, position: number, offset: -1 | 1) => void;
  readonly change: (discIndex: number, position: number, change: Partial<T>) => void;
  readonly reset: (stored: readonly T[]) => void;
};

export function useTrackListDraft<T extends { readonly discIndex: number }>(stored: readonly T[] | null): TrackListDraftControls<T> {
  const [state, dispatch] = useReducer(trackListDraftReducer<T>, initialTrackListDraftState);
  useEffect(() => {
    if (stored !== null && !state.dirty) dispatch(actions.tracksReset(discsOf(stored)));
  }, [stored, state.dirty]);
  return {
    state,
    add: (discIndex, track) => dispatch(actions.trackAdded(discIndex, track)),
    remove: (discIndex, position) => dispatch(actions.trackRemoved(discIndex, position)),
    move: (discIndex, position, offset) => dispatch(actions.trackMoved(discIndex, position, offset)),
    change: (discIndex, position, change) => dispatch(actions.trackChanged<T>(discIndex, position, change)),
    reset: (tracks) => dispatch(actions.tracksReset(discsOf(tracks))),
  };
}
