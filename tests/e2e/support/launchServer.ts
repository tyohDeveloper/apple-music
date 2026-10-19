// Playwright web server: resets the test database, creates the owner from OWNER_* and
// starts the built server (dist/), so end-to-end tests run against the artifact (§8.3).
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createDatabasePools } from "../../../src/db/createDatabasePools.ts";
import { createOwnedLibrary } from "../../../src/db/libraries/libraryMembership.ts";
import { withUserScope } from "../../../src/db/withUserScope.ts";
import { createOwnerAccount } from "../../../src/server/auth/createOwnerAccount.ts";
import { readServerConfig } from "../../../src/server/config/readServerConfig.ts";
import { resetDatabase } from "../../support/resetDatabase.ts";

if (existsSync(".env.test")) process.loadEnvFile(".env.test");
await resetDatabase();
const config = readServerConfig();
const pools = createDatabasePools(config.database);
const owner = { email: process.env["OWNER_EMAIL"] ?? "", name: process.env["OWNER_NAME"] ?? "", password: process.env["OWNER_PASSWORD"] ?? "" };
const ownerId = await createOwnerAccount(config, pools.auth, owner);
await withUserScope(pools.app, ownerId, (tx) => createOwnedLibrary(tx, owner.email));
await pools.close();
const server = spawn("node", ["dist/server/src/server/main.js"], { stdio: "inherit", env: process.env });
process.on("SIGTERM", () => server.kill("SIGTERM"));
server.on("exit", (code) => process.exit(code ?? 0));
