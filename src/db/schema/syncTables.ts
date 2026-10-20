// Sync runs and the Apple Music mirror (docs/design/apple-music-import.md, slice H). A run
// reads the connected Apple Music library into the mirror; at most one per library is
// running. Members read runs; owners and editors start them.
import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgTable, primaryKey, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { authUser } from "./authTables.ts";
import { instant, libraryIdColumn } from "./columns.ts";
import { libraryRowPolicies } from "./libraryRowPolicies.ts";

const count = (name: string) => integer(name).notNull().default(0);

export const syncRun = pgTable("sync_run", {
  libraryId: libraryIdColumn(),
  id: uuid("id").notNull().defaultRandom(),
  status: text("status").notNull().default("running"),
  phase: text("phase").notNull().default("songs"),
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
