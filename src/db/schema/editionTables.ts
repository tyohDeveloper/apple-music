// Editions: the issued forms of an album, each with its own track list (DOMAIN-MODEL.md).
// An edition track names its recording when known and says how it relates to the intended
// album. An album with editions, and a recording on an edition, cannot be deleted.
import { sql } from "drizzle-orm";
import { check, foreignKey, index, integer, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { album } from "./albumTables.ts";
import { instant, libraryIdColumn, partialDate } from "./columns.ts";
import { libraryRowPolicies } from "./libraryRowPolicies.ts";
import { recording } from "./recordingTables.ts";

export const edition = pgTable("edition", {
  libraryId: libraryIdColumn(),
  id: uuid("id").notNull().defaultRandom(),
  albumId: uuid("album_id").notNull(),
  title: text("title").notNull(),
  kind: text("kind").notNull(),
  released: partialDate("released"),
  notes: text("notes"),
  createdAt: instant("created_at").notNull().defaultNow(),
  updatedAt: instant("updated_at").notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.libraryId, t.id] }),
  foreignKey({ columns: [t.libraryId, t.albumId], foreignColumns: [album.libraryId, album.id] }),
  index("edition_album").on(t.libraryId, t.albumId),
  ...libraryRowPolicies("edition"),
]);

export const editionTrack = pgTable("edition_track", {
  libraryId: libraryIdColumn(),
  editionId: uuid("edition_id").notNull(),
  discIndex: integer("disc_index").notNull(),
  position: integer("position").notNull(),
  title: text("title").notNull(),
  recordingId: uuid("recording_id"),
  inclusion: text("inclusion").notNull(),
}, (t) => [
  primaryKey({ columns: [t.libraryId, t.editionId, t.discIndex, t.position] }),
  foreignKey({ columns: [t.libraryId, t.editionId], foreignColumns: [edition.libraryId, edition.id] }).onDelete("cascade"),
  foreignKey({ columns: [t.libraryId, t.recordingId], foreignColumns: [recording.libraryId, recording.id] }),
  check("edition_track_disc_not_negative", sql`${t.discIndex} >= 0`),
  check("edition_track_position_not_negative", sql`${t.position} >= 0`),
  index("edition_track_recording").on(t.libraryId, t.recordingId),
  ...libraryRowPolicies("edition_track"),
]);
