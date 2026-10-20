// Playwright web server: resets the test database, creates the owner from OWNER_*, starts
// the Apple Music fake and the built server (dist/) set up to use it, so end-to-end tests run
// against the artifact (§8.3) without Apple.
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { createDatabasePools } from "../../../src/db/createDatabasePools.ts";
import { createOwnedLibrary } from "../../../src/db/libraries/libraryMembership.ts";
import { withUserScope } from "../../../src/db/withUserScope.ts";
import { createOwnerAccount } from "../../../src/server/auth/createOwnerAccount.ts";
import { readServerConfig } from "../../../src/server/config/readServerConfig.ts";
import { fakeKeyId, fakeTeamId, startAppleMusicFake } from "../../support/appleMusicFake.ts";
import { resetDatabase } from "../../support/resetDatabase.ts";

if (existsSync(".env.test")) process.loadEnvFile(".env.test");
await resetDatabase();
const config = readServerConfig();
const pools = createDatabasePools(config.database);
const owner = { email: process.env["OWNER_EMAIL"] ?? "", name: process.env["OWNER_NAME"] ?? "", password: process.env["OWNER_PASSWORD"] ?? "" };
const ownerId = await createOwnerAccount(config, pools.auth, owner);
await withUserScope(pools.app, ownerId, (tx) => createOwnedLibrary(tx, owner.email));
await pools.close();
const fake = await startAppleMusicFake();
const apple = {
  APPLE_TEAM_ID: fakeTeamId,
  APPLE_MUSICKIT_KEY_ID: fakeKeyId,
  APPLE_MUSICKIT_PRIVATE_KEY: fake.privateKeyPem,
  APPLE_MUSIC_API_BASE_URL: fake.baseUrl,
  TOKEN_ENCRYPTION_KEY: process.env["TOKEN_ENCRYPTION_KEY"] || randomBytes(32).toString("base64"),
};
const server = spawn("node", ["dist/server/src/server/main.js"], { stdio: "inherit", env: { ...process.env, ...apple } });
process.on("SIGTERM", () => server.kill("SIGTERM"));
server.on("exit", (code) => void fake.close().finally(() => process.exit(code ?? 0)));
