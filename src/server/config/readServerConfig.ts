// The only module that reads process.env (docs/ARCHITECTURE.md). Missing required
// variables stop the server at start rather than failing on first use.
import type { DatabaseSettings } from "../../db/createDatabasePools.ts";

type AppleCredentials = { readonly teamId: string; readonly keyId: string; readonly privateKey: string };

export type ServerConfig = {
  readonly host: string;
  readonly port: number;
  readonly publicOrigin: string;
  readonly trustedOrigins: readonly string[];
  readonly authSecret: string;
  readonly production: boolean;
  readonly database: DatabaseSettings;
  readonly migrationsFolder: string;
  readonly clientAssetsDir: string;
  readonly tokenEncryptionKey: string | null;
  readonly apple: AppleCredentials | null;
  readonly appleMusicApiBaseUrl: string;
};

type Environment = Readonly<Record<string, string | undefined>>;

function required(env: Environment, name: string): string {
  const value = env[name];
  if (value === undefined || value === "") throw new Error(`Missing environment variable ${name}`);
  return value;
}

function optional(env: Environment, name: string): string | null {
  const value = env[name];
  return value === undefined || value === "" ? null : value;
}

function readAppleCredentials(env: Environment): AppleCredentials | null {
  const teamId = optional(env, "APPLE_TEAM_ID");
  const keyId = optional(env, "APPLE_MUSICKIT_KEY_ID");
  const privateKey = optional(env, "APPLE_MUSICKIT_PRIVATE_KEY");
  if (teamId === null || keyId === null || privateKey === null) return null;
  return { teamId, keyId, privateKey: privateKey.replaceAll("\\n", "\n") };
}

function readDatabaseSettings(env: Environment): DatabaseSettings {
  return {
    appUrl: required(env, "DATABASE_URL"),
    authUrl: required(env, "DATABASE_AUTH_URL"),
    adminUrl: required(env, "DATABASE_ADMIN_URL"),
    poolMax: Number(optional(env, "DATABASE_POOL_MAX") ?? "10"),
    statementTimeoutMs: Number(optional(env, "DATABASE_STATEMENT_TIMEOUT_MS") ?? "15000"),
  };
}

export function readServerConfig(env: Environment = process.env): ServerConfig {
  return {
    host: optional(env, "HOST") ?? "127.0.0.1",
    port: Number(optional(env, "PORT") ?? "5174"),
    publicOrigin: required(env, "BETTER_AUTH_URL"),
    trustedOrigins: (optional(env, "TRUSTED_ORIGINS") ?? "").split(",").filter((origin) => origin !== ""),
    authSecret: required(env, "BETTER_AUTH_SECRET"),
    production: env["NODE_ENV"] === "production",
    database: readDatabaseSettings(env),
    migrationsFolder: optional(env, "MIGRATIONS_FOLDER") ?? "drizzle",
    clientAssetsDir: optional(env, "CLIENT_ASSETS_DIR") ?? "dist/client",
    tokenEncryptionKey: optional(env, "TOKEN_ENCRYPTION_KEY"),
    apple: readAppleCredentials(env),
    appleMusicApiBaseUrl: optional(env, "APPLE_MUSIC_API_BASE_URL") ?? "https://api.music.apple.com",
  };
}
