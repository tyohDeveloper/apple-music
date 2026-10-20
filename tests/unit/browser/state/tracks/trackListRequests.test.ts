import { describe, expect, it } from "vitest";
import type { AlbumTrack } from "../../../../../src/contracts/albums/albumTrackSchema.ts";
import type { EditionTrack } from "../../../../../src/contracts/editions/editionTrackSchema.ts";
import { albumTracksRequestOf, editionTracksRequestOf } from "../../../../../src/browser/state/tracks/trackListRequests.ts";

const soWhat = { id: "so-what", title: "So What", versionNote: null, durationMs: 562000, creditLine: "Miles Davis" };

describe("albumTracksRequestOf", () => {
  it("sends each disc's tracks by recording, with any printed title and number", () => {
    const track: AlbumTrack = { discIndex: 3, position: 9, title: null, label: "A1", recording: soWhat };
    expect(albumTracksRequestOf({ discs: [[track]], dirty: true })).toEqual({ discs: [{ tracks: [{ recordingId: "so-what", title: null, label: "A1" }] }] });
  });
});

describe("editionTracksRequestOf", () => {
  it("sends each disc's tracks by title and inclusion, with the recording when known", () => {
    const linked: EditionTrack = { discIndex: 0, position: 0, title: "So What", inclusion: "core", recording: soWhat };
    const unlinked: EditionTrack = { discIndex: 1, position: 0, title: "Interview", inclusion: "interview", recording: null };
    expect(editionTracksRequestOf({ discs: [[linked], [unlinked]], dirty: true })).toEqual({
      discs: [{ tracks: [{ title: "So What", inclusion: "core", recordingId: "so-what" }] }, { tracks: [{ title: "Interview", inclusion: "interview", recordingId: null }] }],
    });
  });
});
