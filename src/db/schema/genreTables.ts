// Curated genres (DOMAIN-MODEL.md, docs/design/catalog.md): a tree of genres per library and
// the aliases that name them, Apple Music genre names among them. Sibling names are unique,
// and a genre with subgenres cannot be deleted (ADR-0009).
import { sql } from "drizzle-orm";
import { check, foreignKey, index, pgTable, primaryKey, text, unique, uuid } from "drizzle-orm/pg-core";
import { instant, libraryIdColumn } from "./columns.ts";
import { libraryRowPolicies } from "./libraryRowPolicies.ts";

export const genre = pgTable("genre", {
  libraryId: libraryIdColumn(),
  id: uuid("id").notNull().defaultRandom(),
  parentId: uuid("parent_id"),
  name: text("name").notNull(),
  matchKey: text("match_key").notNull(),
  notes: text("notes"),
  createdAt: instant("created_at").notNull().defaultNow(),
  updatedAt: instant("updated_at").notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.libraryId, t.id] }),
  foreignKey({ name: "genre_parent_fk", columns: [t.libraryId, t.parentId], foreignColumns: [t.libraryId, t.id] }),
  unique("genre_sibling_name").on(t.libraryId, t.parentId, t.matchKey).nullsNotDistinct(),
  check("genre_parent_not_self", sql`${t.parentId} <> ${t.id}`),
  ...libraryRowPolicies("genre"),
]);

export const genreAlias = pgTable("genre_alias", {
  libraryId: libraryIdColumn(),
  id: uuid("id").notNull().defaultRandom(),
  genreId: uuid("genre_id").notNull(),
  name: text("name").notNull(),
  matchKey: text("match_key").notNull(),
}, (t) => [
  primaryKey({ columns: [t.libraryId, t.id] }),
  foreignKey({ columns: [t.libraryId, t.genreId], foreignColumns: [genre.libraryId, genre.id] }).onDelete("cascade"),
  unique("genre_alias_match_key").on(t.libraryId, t.matchKey),
  index("genre_alias_genre").on(t.libraryId, t.genreId),
  ...libraryRowPolicies("genre_alias"),
]);
