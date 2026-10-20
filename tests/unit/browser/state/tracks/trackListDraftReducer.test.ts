import { describe, expect, it } from "vitest";
import { trackAdded, trackChanged, trackMoved, trackRemoved, tracksReset } from "../../../../../src/browser/state/tracks/trackListDraftActions.ts";
import { initialTrackListDraftState, trackListDraftReducer, type TrackListDraftState } from "../../../../../src/browser/state/tracks/trackListDraftReducer.ts";

type Track = { readonly title: string; readonly label: string | null };
const track = (title: string): Track => ({ title, label: null });
const initial: TrackListDraftState<Track> = initialTrackListDraftState;
const stored = trackListDraftReducer(initial, tracksReset([[track("So What"), track("Freddie Freeloader")], [track("Interview")]]));
const titles = (state: TrackListDraftState<Track>) => state.discs.map((disc) => disc.map((entry) => entry.title));

describe("trackListDraftReducer", () => {
  it("track-list-draft/reset takes the stored discs as clean", () => {
    expect(stored.dirty).toBe(false);
    expect(titles(stored)).toEqual([["So What", "Freddie Freeloader"], ["Interview"]]);
  });
  it("track-list-draft/added appends to a disc, or starts the next disc", () => {
    expect(titles(trackListDraftReducer(stored, trackAdded(0, track("Blue in Green"))))).toEqual([["So What", "Freddie Freeloader", "Blue in Green"], ["Interview"]]);
    const next = trackListDraftReducer(stored, trackAdded(2, track("Outtake")));
    expect(titles(next)).toEqual([["So What", "Freddie Freeloader"], ["Interview"], ["Outtake"]]);
    expect(next.dirty).toBe(true);
  });
  it("track-list-draft/removed drops a track, and a disc left empty", () => {
    expect(titles(trackListDraftReducer(stored, trackRemoved(0, 0)))).toEqual([["Freddie Freeloader"], ["Interview"]]);
    expect(titles(trackListDraftReducer(stored, trackRemoved(1, 0)))).toEqual([["So What", "Freddie Freeloader"]]);
  });
  it("track-list-draft/moved swaps neighbours within a disc and ignores moves past either end", () => {
    expect(titles(trackListDraftReducer(stored, trackMoved(0, 1, -1)))).toEqual([["Freddie Freeloader", "So What"], ["Interview"]]);
    expect(titles(trackListDraftReducer(stored, trackMoved(0, 0, -1)))).toEqual(titles(stored));
  });
  it("track-list-draft/changed edits one track", () => {
    const changed = trackListDraftReducer(stored, trackChanged<Track>(0, 1, { label: "A2" }));
    expect(changed.discs[0]?.[1]).toEqual({ title: "Freddie Freeloader", label: "A2" });
    expect(changed.dirty).toBe(true);
  });
});
