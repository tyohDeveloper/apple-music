// Sync runs of a library (docs/design/apple-music-import.md, slice H). Members read the
// latest run. Owners and editors start a run, at most one running and a few starts a minute
// per library, and cancel one; only the owner starts a run that replaces the mirror. The
// run works in the background, and the screen polls the latest run for its progress.
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { FastifyRequest } from "fastify";
import { latestSyncRunSchema } from "../../contracts/apple-music/latestSyncRunSchema.ts";
import { startSyncRunRequestSchema } from "../../contracts/apple-music/startSyncRunRequestSchema.ts";
import { syncRunParamsSchema } from "../../contracts/apple-music/syncRunParamsSchema.ts";
import type { SyncRun } from "../../contracts/apple-music/syncRunSchema.ts";
import { libraryParamsSchema } from "../../contracts/catalog/libraryParamsSchema.ts";
import { connectionOf, memberRoleOf } from "../../db/apple-music/appleMusicConnections.ts";
import { runChangeCountsOf } from "../../db/apple-music/mirrorItems.ts";
import { finishSyncRun, latestSyncRun, startSyncRun, syncRunOf, type SyncRunRow } from "../../db/apple-music/syncRuns.ts";
import { CatalogRefusal, requireFound } from "../../db/catalog/catalogRefusal.ts";
import { runInLibrary } from "../../db/catalog/runInLibrary.ts";
import type { ScopedTransaction } from "../../db/withUserScope.ts";
import { libraryScopeOf, type CatalogApp } from "../catalog/typedRoutes.ts";
import { requireAppleMusic, type AppleMusicServices } from "./appleMusicServices.ts";
import type { SyncRunner } from "./syncRunner.ts";

export type SyncRouteParts = {
  readonly db: NodePgDatabase;
  readonly services: AppleMusicServices | null;
  readonly runner: SyncRunner;
  readonly startsPerMinute: number;
};

const path = "/api/libraries/:libraryId/apple-music/sync-runs";

function replyOf(row: SyncRunRow): SyncRun {
  const { songs, albums, artists, playlists, catalogSongs, catalogAlbums, added, changed, removed } = row;
  return {
    id: row.id, status: row.status, phase: row.phase, replaceMirror: row.replaceMirror, errorCode: row.errorCode,
    startedAt: row.startedAt.toISOString(), finishedAt: row.finishedAt?.toISOString() ?? null,
    counts: { songs, albums, artists, playlists, catalogSongs, catalogAlbums, added, changed, removed },
  };
}

// Members read; starting and cancelling need an owner or editor, replacing the mirror the owner.
async function requireRole(tx: ScopedTransaction, libraryId: string, need: "member" | "editor" | "owner"): Promise<void> {
  const role = requireFound(await memberRoleOf(tx, libraryId));
  if ((need === "editor" && role === "viewer") || (need === "owner" && role !== "owner")) throw new CatalogRefusal("forbidden");
}

const startsByLibrary = (request: FastifyRequest): string => `sync-start:${String((request.params as { libraryId?: unknown }).libraryId)}`;

function registerStart(app: CatalogApp, parts: SyncRouteParts): void {
  const schema = { params: libraryParamsSchema, body: startSyncRunRequestSchema, response: { 202: latestSyncRunSchema } };
  const rateLimit = { max: parts.startsPerMinute, timeWindow: "1 minute", keyGenerator: startsByLibrary };
  app.post(path, { schema, config: { rateLimit } }, async (request, reply) => {
    const services = requireAppleMusic(parts.services);
    const scope = libraryScopeOf(request, request.params);
    const { replaceMirror } = request.body;
    const started = await runInLibrary(parts.db, scope, async (tx) => {
      await requireRole(tx, scope.libraryId, replaceMirror ? "owner" : "editor");
      const connection = await connectionOf(tx, scope.libraryId);
      if (connection === null || connection.storefront === null) throw new CatalogRefusal("apple-music-not-connected");
      return { run: await startSyncRun(tx, scope.libraryId, scope.userId, replaceMirror), storefront: connection.storefront, sealedToken: connection.sealedToken };
    });
    parts.runner.start({ scope, runId: started.run.id, replaceMirror, storefront: started.storefront, sealedToken: started.sealedToken, services });
    return reply.status(202).send({ run: replyOf(started.run) });
  });
}

// A running run with no task in this process (another server's) is marked interrupted.
function registerCancel(app: CatalogApp, parts: SyncRouteParts): void {
  app.post(`${path}/:runId/cancel`, { schema: { params: syncRunParamsSchema } }, async (request, reply) => {
    const scope = libraryScopeOf(request, request.params);
    const ids = { libraryId: scope.libraryId, runId: request.params.runId };
    await runInLibrary(parts.db, scope, async (tx) => {
      await requireRole(tx, scope.libraryId, "editor");
      if (requireFound(await syncRunOf(tx, ids)).status !== "running") throw new CatalogRefusal("sync-not-running");
      if (parts.runner.cancel(ids.runId)) return;
      const { added, changed, removed } = await runChangeCountsOf(tx, ids);
      await finishSyncRun(tx, ids, { status: "interrupted", errorCode: null }, { added, changed, removed });
    });
    return reply.status(204).send();
  });
}

export function registerSyncRoutes(app: CatalogApp, parts: SyncRouteParts): void {
  app.get(`${path}/latest`, { schema: { params: libraryParamsSchema, response: { 200: latestSyncRunSchema } } }, (request) =>
    runInLibrary(parts.db, libraryScopeOf(request, request.params), async (tx) => {
      await requireRole(tx, request.params.libraryId, "member");
      const row = await latestSyncRun(tx, request.params.libraryId);
      return { run: row === null ? null : replyOf(row) };
    }));
  registerStart(app, parts);
  registerCancel(app, parts);
}
