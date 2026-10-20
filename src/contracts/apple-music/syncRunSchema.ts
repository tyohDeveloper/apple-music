// A sync run as members see it (docs/design/apple-music-import.md, slice H): its status and
// phase, whether it replaces the mirror, when it started and finished, why it failed, how
// many items of each kind it read, and what changed in the mirror.
import Type from "typebox";

const count = Type.Integer({ minimum: 0 });

export const syncRunSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    status: Type.Union([
      Type.Literal("running"),
      Type.Literal("succeeded"),
      Type.Literal("failed"),
      Type.Literal("interrupted"),
      Type.Literal("needs-confirmation"),
      Type.Literal("cancelled"),
    ]),
    phase: Type.Union([
      Type.Literal("songs"),
      Type.Literal("albums"),
      Type.Literal("artists"),
      Type.Literal("playlists"),
      Type.Literal("catalog-songs"),
      Type.Literal("catalog-albums"),
      Type.Literal("removals"),
    ]),
    replaceMirror: Type.Boolean(),
    startedAt: Type.String({ format: "date-time" }),
    finishedAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
    errorCode: Type.Union([Type.String(), Type.Null()]),
    counts: Type.Object(
      { songs: count, albums: count, artists: count, playlists: count, catalogSongs: count, catalogAlbums: count, added: count, changed: count, removed: count },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export type SyncRun = Type.Static<typeof syncRunSchema>;
