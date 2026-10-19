// Libraries are the per-Apple-ID datastores (ADR-0003). Row visibility follows
// membership: the transaction setting app.user_id names the signed-in user.
import { sql } from "drizzle-orm";
import { check, pgPolicy, pgRole, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUser } from "./authTables.ts";

export const appRole = pgRole("apple_music_app").existing();
const instant = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });
const isMemberOfThisLibrary = sql`exists (select 1 from library_member m
  where m.library_id = library.id and m.user_id = current_setting('app.user_id', true))`;

export const library = pgTable("library", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull(),
  storefront: text("storefront"),
  createdAt: instant("created_at").notNull().defaultNow(),
  updatedAt: instant("updated_at").notNull().defaultNow(),
}, () => [
  pgPolicy("library_read_by_members", { for: "select", to: appRole, using: isMemberOfThisLibrary }),
  pgPolicy("library_update_by_members", {
    for: "update", to: appRole, using: isMemberOfThisLibrary, withCheck: isMemberOfThisLibrary,
  }),
]);

export const libraryMember = pgTable("library_member", {
  libraryId: uuid("library_id").notNull().references(() => library.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  createdAt: instant("created_at").notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.libraryId, t.userId] }),
  check("library_member_role_known", sql`${t.role} in ('owner', 'editor', 'viewer')`),
  pgPolicy("library_member_read_own", {
    for: "select", to: appRole, using: sql`${t.userId} = current_setting('app.user_id', true)`,
  }),
]);
