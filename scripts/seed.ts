// Creates the owner account (OWNER_EMAIL, OWNER_NAME, OWNER_PASSWORD) and, if it has
// none, an empty library named after the owner's email.
import { createDatabasePools } from "../src/db/createDatabasePools.ts";
import { createOwnedLibrary, listMemberLibraries } from "../src/db/libraries/libraryMembership.ts";
import { migrateDatabase } from "../src/db/migrateDatabase.ts";
import { withUserScope } from "../src/db/withUserScope.ts";
import { createOwnerAccount } from "../src/server/auth/createOwnerAccount.ts";
import { readServerConfig } from "../src/server/config/readServerConfig.ts";

const config = readServerConfig();
const owner = {
  email: process.env["OWNER_EMAIL"] ?? "",
  name: process.env["OWNER_NAME"] ?? "",
  password: process.env["OWNER_PASSWORD"] ?? "",
};
await migrateDatabase(config.database.adminUrl, config.migrationsFolder);
const pools = createDatabasePools(config.database);
try {
  const userId = await createOwnerAccount(config, pools.auth, owner);
  await withUserScope(pools.app, userId, async (tx) => {
    if ((await listMemberLibraries(tx)).length === 0) await createOwnedLibrary(tx, owner.email);
  });
  console.log(`Owner ${owner.email} created.`);
} finally {
  await pools.close();
}
