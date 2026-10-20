// A library's Apple Music connection (docs/design/apple-music-import.md, slice G). Any member
// reads its state; the owner connects with the Music User Token MusicKit gave them, which is
// checked with Apple (GET /v1/me/storefront) before it is sealed and stored, or disconnects.
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { storefrontOf } from "../../apple-music/storefrontOf.ts";
import { appleMusicConnectionSchema, type AppleMusicConnection } from "../../contracts/apple-music/appleMusicConnectionSchema.ts";
import { connectAppleMusicRequestSchema } from "../../contracts/apple-music/connectAppleMusicRequestSchema.ts";
import { libraryParamsSchema } from "../../contracts/catalog/libraryParamsSchema.ts";
import { connectionOf, memberRoleOf, removeConnection, saveConnection, type StoredConnection } from "../../db/apple-music/appleMusicConnections.ts";
import { CatalogRefusal, requireFound } from "../../db/catalog/catalogRefusal.ts";
import { runInLibrary } from "../../db/catalog/runInLibrary.ts";
import type { ScopedTransaction } from "../../db/withUserScope.ts";
import { sealToken } from "../../platform/tokenCipher.ts";
import { libraryScopeOf, type CatalogApp } from "../catalog/typedRoutes.ts";
import { requireAppleMusic, type AppleMusicServices } from "./appleMusicServices.ts";

const path = "/api/libraries/:libraryId/apple-music/connection";

function replyOf(stored: StoredConnection | null): AppleMusicConnection {
  if (stored === null) return { status: "not-connected", storefront: null, connectedAt: null };
  return { status: "connected", storefront: stored.storefront, connectedAt: stored.connectedAt.toISOString() };
}

// Members only; connecting and disconnecting also need the owner.
async function requireRole(tx: ScopedTransaction, libraryId: string, owner: boolean): Promise<void> {
  const role = requireFound(await memberRoleOf(tx, libraryId));
  if (owner && role !== "owner") throw new CatalogRefusal("forbidden");
}

const params = libraryParamsSchema;
const connect = { params, body: connectAppleMusicRequestSchema, response: { 200: appleMusicConnectionSchema } };

function registerConnect(app: CatalogApp, db: NodePgDatabase, services: AppleMusicServices | null): void {
  app.put(path, { schema: connect, config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, (request) => {
    const ready = requireAppleMusic(services);
    const scope = libraryScopeOf(request, request.params);
    return runInLibrary(db, scope, async (tx) => {
      await requireRole(tx, scope.libraryId, true);
      const storefront = await storefrontOf(ready.client, request.body.musicUserToken);
      await saveConnection(tx, { ...scope, sealedToken: sealToken(ready.tokenKey, scope.libraryId, request.body.musicUserToken), storefront });
      return replyOf(await connectionOf(tx, scope.libraryId));
    });
  });
}

export function registerConnectionRoutes(app: CatalogApp, db: NodePgDatabase, services: AppleMusicServices | null): void {
  app.get(path, { schema: { params, response: { 200: appleMusicConnectionSchema } } }, (request) =>
    runInLibrary(db, libraryScopeOf(request, request.params), async (tx) => {
      await requireRole(tx, request.params.libraryId, false);
      return replyOf(await connectionOf(tx, request.params.libraryId));
    }));
  registerConnect(app, db, services);
  app.delete(path, { schema: { params } }, async (request, reply) => {
    await runInLibrary(db, libraryScopeOf(request, request.params), async (tx) => {
      await requireRole(tx, request.params.libraryId, true);
      await removeConnection(tx, request.params.libraryId);
    });
    return reply.status(204).send();
  });
}
