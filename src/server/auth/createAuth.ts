// Better Auth with email and password for the owner (ADR-0008). Sign-up is closed
// unless explicitly allowed, which only the owner-account script does. Passwords are
// hashed and verified through the mandated argon2 binding.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { authAccount, authSession, authUser, authVerification } from "../../db/schema/authTables.ts";
import { hashPassword } from "../../platform/hashPassword.ts";
import { verifyPassword } from "../../platform/verifyPassword.ts";
import type { ServerConfig } from "../config/readServerConfig.ts";

export type AuthSettings = Pick<ServerConfig, "publicOrigin" | "trustedOrigins" | "authSecret" | "production">;

export function createAuth(settings: AuthSettings, database: NodePgDatabase, allowSignUp = false) {
  return betterAuth({
    appName: "Apple Music Library Manager",
    baseURL: settings.publicOrigin,
    secret: settings.authSecret,
    trustedOrigins: [settings.publicOrigin, ...settings.trustedOrigins],
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: { user: authUser, session: authSession, account: authAccount, verification: authVerification },
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: !allowSignUp,
      minPasswordLength: 12,
      password: { hash: hashPassword, verify: ({ hash, password }) => verifyPassword(hash, password) },
    },
    advanced: { useSecureCookies: settings.production, defaultCookieAttributes: { sameSite: "lax", httpOnly: true } },
  });
}

export type AppAuth = ReturnType<typeof createAuth>;
