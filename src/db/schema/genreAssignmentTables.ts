// The ordered genres of albums, recordings and performers (docs/design/catalog.md, Genres):
// the first is the main genre, a genre appears once per entity, and a genre in use cannot be
// deleted (ADR-0009). Assignments are deleted with their entity.
import { sql } from "drizzle-orm";
import { check, foreignKey, index, integer, pgTable, primaryKey, unique, uuid } from "drizzle-orm/pg-core";
import { album } from "./albumTables.ts";
import { libraryIdColumn } from "./columns.ts";
import { genre } from "./genreTables.ts";
import { libraryRowPolicies } from "./libraryRowPolicies.ts";
import { performer } from "./performerTables.ts";
import { recording } from "./recordingTables.ts";

const assignmentColumns = () => ({ position: integer("position").notNull(), genreId: uuid("genre_id").notNull() });

export const albumGenre = pgTable("album_genre", { libraryId: libraryIdColumn(), albumId: uuid("album_id").notNull(), ...assignmentColumns() }, (t) => [
  primaryKey({ columns: [t.libraryId, t.albumId, t.position] }),
  unique("album_genre_once").on(t.libraryId, t.albumId, t.genreId),
  foreignKey({ columns: [t.libraryId, t.albumId], foreignColumns: [album.libraryId, album.id] }).onDelete("cascade"),
  foreignKey({ columns: [t.libraryId, t.genreId], foreignColumns: [genre.libraryId, genre.id] }),
  check("album_genre_position_range", sql`${t.position} between 0 and 19`),
  index("album_genre_genre").on(t.libraryId, t.genreId),
  ...libraryRowPolicies("album_genre"),
]);

export const recordingGenre = pgTable("recording_genre", { libraryId: libraryIdColumn(), recordingId: uuid("recording_id").notNull(), ...assignmentColumns() }, (t) => [
  primaryKey({ columns: [t.libraryId, t.recordingId, t.position] }),
  unique("recording_genre_once").on(t.libraryId, t.recordingId, t.genreId),
  foreignKey({ name: "recording_genre_recording_fk", columns: [t.libraryId, t.recordingId], foreignColumns: [recording.libraryId, recording.id] }).onDelete("cascade"),
  foreignKey({ columns: [t.libraryId, t.genreId], foreignColumns: [genre.libraryId, genre.id] }),
  check("recording_genre_position_range", sql`${t.position} between 0 and 19`),
  index("recording_genre_genre").on(t.libraryId, t.genreId),
  ...libraryRowPolicies("recording_genre"),
]);

export const performerGenre = pgTable("performer_genre", { libraryId: libraryIdColumn(), performerId: uuid("performer_id").notNull(), ...assignmentColumns() }, (t) => [
  primaryKey({ columns: [t.libraryId, t.performerId, t.position] }),
  unique("performer_genre_once").on(t.libraryId, t.performerId, t.genreId),
  foreignKey({ name: "performer_genre_performer_fk", columns: [t.libraryId, t.performerId], foreignColumns: [performer.libraryId, performer.id] }).onDelete("cascade"),
  foreignKey({ columns: [t.libraryId, t.genreId], foreignColumns: [genre.libraryId, genre.id] }),
  check("performer_genre_position_range", sql`${t.position} between 0 and 19`),
  index("performer_genre_genre").on(t.libraryId, t.genreId),
  ...libraryRowPolicies("performer_genre"),
]);
