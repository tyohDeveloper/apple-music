// Recordings and their ordered credits (DOMAIN-MODEL.md). A credit names a performer and,
// optionally, which of that performer's names was printed; a performer or name that is
// credited cannot be deleted (ADR-0009). Credit rows are keyed by position: the list is
// replaced whole, so a credit has no identity of its own.
import { sql } from "drizzle-orm";
import { check, foreignKey, index, integer, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { instant, libraryIdColumn, partialDate } from "./columns.ts";
import { creditColumns } from "./creditColumns.ts";
import { libraryRowPolicies } from "./libraryRowPolicies.ts";
import { performer, performerName } from "./performerTables.ts";

export const recording = pgTable("recording", {
  libraryId: libraryIdColumn(),
  id: uuid("id").notNull().defaultRandom(),
  title: text("title").notNull(),
  matchKey: text("match_key").notNull(),
  versionNote: text("version_note"),
  kind: text("kind").notNull(),
  recordedFrom: partialDate("recorded_from"),
  recordedTo: partialDate("recorded_to"),
  venue: text("venue"),
  durationMs: integer("duration_ms"),
  notes: text("notes"),
  createdAt: instant("created_at").notNull().defaultNow(),
  updatedAt: instant("updated_at").notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.libraryId, t.id] }),
  check("recording_duration_not_negative", sql`${t.durationMs} >= 0`),
  index("recording_match_key").on(t.libraryId, t.matchKey),
  ...libraryRowPolicies("recording"),
]);

export const recordingCredit = pgTable("recording_credit", {
  libraryId: libraryIdColumn(),
  recordingId: uuid("recording_id").notNull(),
  ...creditColumns(),
}, (t) => [
  primaryKey({ columns: [t.libraryId, t.recordingId, t.position] }),
  foreignKey({ columns: [t.libraryId, t.recordingId], foreignColumns: [recording.libraryId, recording.id] }).onDelete("cascade"),
  foreignKey({ columns: [t.libraryId, t.performerId], foreignColumns: [performer.libraryId, performer.id] }),
  foreignKey({
    name: "recording_credit_credited_name_fk",
    columns: [t.libraryId, t.performerId, t.creditedNameId],
    foreignColumns: [performerName.libraryId, performerName.performerId, performerName.id],
  }),
  check("recording_credit_position_not_negative", sql`${t.position} >= 0`),
  index("recording_credit_performer").on(t.libraryId, t.performerId),
  ...libraryRowPolicies("recording_credit"),
]);
