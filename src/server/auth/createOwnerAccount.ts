// Creates the owner account (ADR-0008) through Better Auth itself, with sign-up
// allowed for this one call only. Used by `npm run seed` and by tests.
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { createAuth, type AuthSettings } from "./createAuth.ts";

export type OwnerAccount = { readonly email: string; readonly name: string; readonly password: string };

export async function createOwnerAccount(
  settings: AuthSettings,
  database: NodePgDatabase,
  owner: OwnerAccount,
): Promise<string> {
  const auth = createAuth(settings, database, true);
  const result = await auth.api.signUpEmail({ body: owner });
  return result.user.id;
}
