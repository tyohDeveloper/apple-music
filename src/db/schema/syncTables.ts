// Sync runs and the Apple Music mirror (docs/design/apple-music-import.md, slice H). A run
// reads the connected Apple Music library into the mirror; at most one per library is
// running. Members read runs and the mirror; owners and editors start runs, which write it.
// Mirror items keep Apple's attributes and relationship ids as returned, and the runs that
// first saw, last saw, last changed and found them removed.
import { sql } from "drizzle-orm";
import { boolean, check, foreignKey, index, integer, jsonb, pgTable, primaryKey, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { authUser } from "./authTables.ts";
import { instant, libraryIdColumn } from "./columns.ts";
import { libraryRowPolicies } from "./libraryRowPolicies.ts";

const count = (name: string) => integer(name).notNull().default(0);

export type SyncStatus = "running" | "succeeded" | "failed" | "interrupted" | "needs-confirmation" | "cancelled";
export type SyncPhase = "songs" | "albums" | "artists" | "playlists" | "catalog-songs" | "catalog-albums" | "removals";

export const syncRun = pgTable("sync_run", {
  libraryId: libraryIdColumn(),
  id: uuid("id").notNull().defaultRandom(),
  status: text("status").$type<SyncStatus>().notNull().default("running"),
  phase: text("phase").$type<SyncPhase>().notNull().default("songs"),
  replaceMirror: boolean("replace_mirror").notNull().default(false),
  startedBy: text("started_by").references(() => authUser.id, { onDelete: "set null" }),
  startedAt: instant("started_at").notNull().defaultNow(),
  finishedAt: instant("finished_at"),
  errorCode: text("error_code"),
  songs: count("songs"),
  albums: count("albums"),
  artists: count("artists"),
  playlists: count("playlists"),
  catalogSongs: count("catalog_songs"),
  catalogAlbums: count("catalog_albums"),
  added: count("added"),
  changed: count("changed"),
  removed: count("removed"),
}, (t) => [
  primaryKey({ columns: [t.libraryId, t.id] }),
  check("sync_run_status", sql`${t.status} in ('running', 'succeeded', 'failed', 'interrupted', 'needs-confirmation', 'cancelled')`),
  check("sync_run_phase", sql`${t.phase} in ('songs', 'albums', 'artists', 'playlists', 'catalog-songs', 'catalog-albums', 'removals')`),
  check("sync_run_finished_unless_running", sql`(${t.status} = 'running') = (${t.finishedAt} is null)`),
  check("sync_run_error_only_when_failed", sql`(${t.status} = 'failed') = (${t.errorCode} is not null)`),
  check("sync_run_counts_not_negative", sql`least(${t.songs}, ${t.albums}, ${t.artists}, ${t.playlists}, ${t.catalogSongs}, ${t.catalogAlbums}, ${t.added}, ${t.changed}, ${t.removed}) >= 0`),
  uniqueIndex("sync_run_one_running").on(t.libraryId).where(sql`${t.status} = 'running'`),
  index("sync_run_latest").on(t.libraryId, t.startedAt),
  ...libraryRowPolicies("sync_run"),
]);

export type AppleAttributes = Readonly<Record<string, unknown>>;
export type AppleRelationshipIds = Readonly<Record<string, readonly string[]>>;

const runColumns = [["first_seen", "firstSeenRunId"], ["last_seen", "lastSeenRunId"], ["changed", "changedRunId"], ["removed", "removedRunId"]] as const;

export const appleLibraryItem = pgTable("apple_library_item", {
  libraryId: libraryIdColumn(),
  kind: text("kind").notNull(),
  appleId: text("apple_id").notNull(),
  catalogId: text("catalog_id"),
  attributes: jsonb("attributes").$type<AppleAttributes>().notNull(),
  relationships: jsonb("relationships").$type<AppleRelationshipIds>().notNull(),
  firstSeenRunId: uuid("first_seen_run_id").notNull(),
  lastSeenRunId: uuid("last_seen_run_id").notNull(),
  changedRunId: uuid("changed_run_id").notNull(),
  removedRunId: uuid("removed_run_id"),
}, (t) => [
  primaryKey({ columns: [t.libraryId, t.kind, t.appleId] }),
  check("apple_library_item_kind", sql`${t.kind} in ('song', 'album', 'artist', 'playlist')`),
  ...runColumns.map(([name, column]) =>
    foreignKey({ name: `apple_library_item_${name}_run_fk`, columns: [t.libraryId, t[column]], foreignColumns: [syncRun.libraryId, syncRun.id] })),
  ...libraryRowPolicies("apple_library_item"),
]);

// Catalog songs and albums the library items point to, in the library's storefront.
export const appleCatalogItem = pgTable("apple_catalog_item", {
  libraryId: libraryIdColumn(),
  kind: text("kind").notNull(),
  storefront: text("storefront").notNull(),
  catalogId: text("catalog_id").notNull(),
  attributes: jsonb("attributes").$type<AppleAttributes>().notNull(),
  relationships: jsonb("relationships").$type<AppleRelationshipIds>().notNull(),
  fetchedRunId: uuid("fetched_run_id").notNull(),
}, (t) => [
  primaryKey({ columns: [t.libraryId, t.kind, t.storefront, t.catalogId] }),
  check("apple_catalog_item_kind", sql`${t.kind} in ('song', 'album')`),
  foreignKey({ name: "apple_catalog_item_fetched_run_fk", columns: [t.libraryId, t.fetchedRunId], foreignColumns: [syncRun.libraryId, syncRun.id] }),
  ...libraryRowPolicies("apple_catalog_item"),
]);
