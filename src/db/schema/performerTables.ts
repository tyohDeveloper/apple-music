// Performers, their names and their standing relations (DOMAIN-MODEL.md). Keys are
// (library_id, id) and every reference is composite, so no row can point outside its
// library (invariant 1). Taxonomy keys are text validated by request schemas (ADR-0009).
import { sql } from "drizzle-orm";
import { boolean, check, foreignKey, index, pgTable, primaryKey, text, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { instant, libraryIdColumn, partialDate } from "./columns.ts";
import { libraryRowPolicies } from "./libraryRowPolicies.ts";

export const performer = pgTable("performer", {
  libraryId: libraryIdColumn(),
  id: uuid("id").notNull().defaultRandom(),
  kind: text("kind").notNull(),
  began: partialDate("began"),
  ended: partialDate("ended"),
  area: text("area"),
  disambiguation: text("disambiguation"),
  notes: text("notes"),
  createdAt: instant("created_at").notNull().defaultNow(),
  updatedAt: instant("updated_at").notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.libraryId, t.id] }), ...libraryRowPolicies("performer")]);

export const performerName = pgTable("performer_name", {
  libraryId: libraryIdColumn(),
  id: uuid("id").notNull().defaultRandom(),
  performerId: uuid("performer_id").notNull(),
  name: text("name").notNull(),
  sortName: text("sort_name").notNull(),
  kind: text("kind").notNull(),
  locale: text("locale"),
  validFrom: partialDate("valid_from"),
  validTo: partialDate("valid_to"),
  isPreferred: boolean("is_preferred").notNull().default(false),
  matchKey: text("match_key").notNull(),
}, (t) => [
  primaryKey({ columns: [t.libraryId, t.id] }),
  foreignKey({ columns: [t.libraryId, t.performerId], foreignColumns: [performer.libraryId, performer.id] }).onDelete("cascade"),
  unique("performer_name_of_performer").on(t.libraryId, t.performerId, t.id),
  uniqueIndex("performer_name_one_preferred").on(t.libraryId, t.performerId).where(sql`${t.isPreferred}`),
  index("performer_name_performer").on(t.libraryId, t.performerId),
  index("performer_name_match_key").on(t.libraryId, t.matchKey),
  ...libraryRowPolicies("performer_name"),
]);

export const performerRelation = pgTable("performer_relation", {
  libraryId: libraryIdColumn(),
  id: uuid("id").notNull().defaultRandom(),
  subjectId: uuid("subject_id").notNull(),
  objectId: uuid("object_id").notNull(),
  kind: text("kind").notNull(),
  roles: text("roles").array().notNull().default(sql`'{}'::text[]`),
  began: partialDate("began"),
  ended: partialDate("ended"),
  notes: text("notes"),
}, (t) => [
  primaryKey({ columns: [t.libraryId, t.id] }),
  foreignKey({ columns: [t.libraryId, t.subjectId], foreignColumns: [performer.libraryId, performer.id] }).onDelete("cascade"),
  foreignKey({ columns: [t.libraryId, t.objectId], foreignColumns: [performer.libraryId, performer.id] }).onDelete("cascade"),
  check("performer_relation_not_self", sql`${t.subjectId} <> ${t.objectId}`),
  index("performer_relation_subject").on(t.libraryId, t.subjectId),
  index("performer_relation_object").on(t.libraryId, t.objectId),
  ...libraryRowPolicies("performer_relation"),
]);
