// Albums as their artists intended them (DOMAIN-MODEL.md): ordered album credits and the
// intended track list. Both lists are keyed by position and replaced whole (ADR-0009). A
// recording on a track list, like a credited performer, cannot be deleted.
import { sql } from "drizzle-orm";
import { check, foreignKey, index, integer, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { instant, libraryIdColumn, partialDate } from "./columns.ts";
import { creditColumns } from "./creditColumns.ts";
import { libraryRowPolicies } from "./libraryRowPolicies.ts";
import { performer, performerName } from "./performerTables.ts";
import { recording } from "./recordingTables.ts";

export const album = pgTable("album", {
  libraryId: libraryIdColumn(),
  id: uuid("id").notNull().defaultRandom(),
  title: text("title").notNull(),
  matchKey: text("match_key").notNull(),
  kind: text("kind").notNull(),
  released: partialDate("released"),
  label: text("label"),
  notes: text("notes"),
  createdAt: instant("created_at").notNull().defaultNow(),
  updatedAt: instant("updated_at").notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.libraryId, t.id] }),
  index("album_match_key").on(t.libraryId, t.matchKey),
  ...libraryRowPolicies("album"),
]);

export const albumCredit = pgTable("album_credit", {
  libraryId: libraryIdColumn(),
  albumId: uuid("album_id").notNull(),
  ...creditColumns(),
}, (t) => [
  primaryKey({ columns: [t.libraryId, t.albumId, t.position] }),
  foreignKey({ columns: [t.libraryId, t.albumId], foreignColumns: [album.libraryId, album.id] }).onDelete("cascade"),
  foreignKey({ columns: [t.libraryId, t.performerId], foreignColumns: [performer.libraryId, performer.id] }),
  foreignKey({
    name: "album_credit_credited_name_fk",
    columns: [t.libraryId, t.performerId, t.creditedNameId],
    foreignColumns: [performerName.libraryId, performerName.performerId, performerName.id],
  }),
  check("album_credit_position_not_negative", sql`${t.position} >= 0`),
  index("album_credit_performer").on(t.libraryId, t.performerId),
  ...libraryRowPolicies("album_credit"),
]);

export const albumTrack = pgTable("album_track", {
  libraryId: libraryIdColumn(),
  albumId: uuid("album_id").notNull(),
  discIndex: integer("disc_index").notNull(),
  position: integer("position").notNull(),
  recordingId: uuid("recording_id").notNull(),
  title: text("title"),
  label: text("label"),
}, (t) => [
  primaryKey({ columns: [t.libraryId, t.albumId, t.discIndex, t.position] }),
  foreignKey({ columns: [t.libraryId, t.albumId], foreignColumns: [album.libraryId, album.id] }).onDelete("cascade"),
  foreignKey({ columns: [t.libraryId, t.recordingId], foreignColumns: [recording.libraryId, recording.id] }),
  check("album_track_disc_not_negative", sql`${t.discIndex} >= 0`),
  check("album_track_position_not_negative", sql`${t.position} >= 0`),
  index("album_track_recording").on(t.libraryId, t.recordingId),
  ...libraryRowPolicies("album_track"),
]);
