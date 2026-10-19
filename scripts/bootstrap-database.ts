// Creates the apple_music_app and apple_music_auth login roles for the environment
// described by DATABASE_URL and DATABASE_AUTH_URL, using DATABASE_ADMIN_URL.
// Role names are fixed because migrations grant privileges to them by name.
import { bootstrapDatabaseRoles, type RoleCredential } from "../src/db/bootstrapDatabaseRoles.ts";

const expected: Readonly<Record<string, string>> = { DATABASE_URL: "apple_music_app", DATABASE_AUTH_URL: "apple_music_auth" };

function credentialFrom(variable: string): RoleCredential {
  const url = new URL(process.env[variable] ?? "");
  const name = decodeURIComponent(url.username);
  if (name !== expected[variable]) throw new Error(`${variable} must connect as ${expected[variable]}, not ${name}`);
  return { name, password: decodeURIComponent(url.password) };
}

const adminUrl = process.env["DATABASE_ADMIN_URL"] ?? "";
await bootstrapDatabaseRoles(adminUrl, Object.keys(expected).map(credentialFrom));
console.log("Database roles are ready.");
