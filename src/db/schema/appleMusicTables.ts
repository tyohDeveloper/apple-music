// The Apple Music connection of a library (docs/design/apple-music-import.md, slice G): the
// Music User Token sealed by the application (src/platform/tokenCipher.ts), who connected it
// and when. Members read it; only the owner connects, reconnects or disconnects.
import { sql } from "drizzle-orm";
import { pgPolicy, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUser } from "./authTables.ts";
import { appRole, library } from "./libraryTables.ts";

const instant = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });
const readable = sql`library_id = app_current_library()`;
const owned = sql`library_id = app_current_owned_library()`;

export const appleMusicConnection = pgTable("apple_music_connection", {
  libraryId: uuid("library_id").primaryKey().references(() => library.id, { onDelete: "cascade" }),
  sealedToken: text("sealed_token").notNull(),
  connectedBy: text("connected_by").notNull().references(() => authUser.id, { onDelete: "cascade" }),
  connectedAt: instant("connected_at").notNull().defaultNow(),
}, () => [
  pgPolicy("apple_music_connection_read", { for: "select", to: appRole, using: readable }),
  pgPolicy("apple_music_connection_insert", { for: "insert", to: appRole, withCheck: owned }),
  pgPolicy("apple_music_connection_update", { for: "update", to: appRole, using: owned, withCheck: owned }),
  pgPolicy("apple_music_connection_delete", { for: "delete", to: appRole, using: owned }),
]);
