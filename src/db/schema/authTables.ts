// Better Auth core tables (better-auth 1.7), kept in their own Postgres schema so
// that only the apple_music_auth role can reach them (docs/ARCHITECTURE.md).
import { boolean, pgSchema, text, timestamp } from "drizzle-orm/pg-core";

export const authSchema = pgSchema("auth");
const instant = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const authUser = authSchema.table("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: instant("created_at").notNull().defaultNow(),
  updatedAt: instant("updated_at").notNull().defaultNow(),
});

export const authSession = authSchema.table("session", {
  id: text("id").primaryKey(),
  expiresAt: instant("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: instant("created_at").notNull().defaultNow(),
  updatedAt: instant("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
});

export const authAccount = authSchema.table("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: instant("access_token_expires_at"),
  refreshTokenExpiresAt: instant("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: instant("created_at").notNull().defaultNow(),
  updatedAt: instant("updated_at").notNull().defaultNow(),
});

export const authVerification = authSchema.table("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: instant("expires_at").notNull(),
  createdAt: instant("created_at").notNull().defaultNow(),
  updatedAt: instant("updated_at").notNull().defaultNow(),
});
