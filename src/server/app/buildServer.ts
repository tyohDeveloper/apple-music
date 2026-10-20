// Composition root: plugins, routes and the session guard. Returns the instance without
// listening so integration tests can use inject().
import Fastify, { type FastifyInstance } from "fastify";
import type { DatabasePools } from "../../db/createDatabasePools.ts";
import { isPartialDate } from "../../partial-dates/isPartialDate.ts";
import { appleMusicServicesOf, type AppleMusicServices } from "../apple-music/appleMusicServices.ts";
import { registerAppleMusicRoutes } from "../apple-music/registerAppleMusicRoutes.ts";
import { registerConnectionRoutes } from "../apple-music/registerConnectionRoutes.ts";
import { registerSyncRoutes } from "../apple-music/registerSyncRoutes.ts";
import { syncRunnerOf, type SyncRunner } from "../apple-music/syncRunner.ts";
import { createAuth } from "../auth/createAuth.ts";
import { registerAuthRoutes } from "../auth/registerAuthRoutes.ts";
import { registerSessionGuard } from "../auth/registerSessionGuard.ts";
import { registerCatalogRoutes } from "../catalog/registerCatalogRoutes.ts";
import { withTypeBox } from "../catalog/typedRoutes.ts";
import type { ServerConfig } from "../config/readServerConfig.ts";
import { registerLibraryRoutes } from "../libraries/registerLibraryRoutes.ts";
import { registerObservability } from "../observability/registerObservability.ts";
import { registerClientAssets } from "./registerClientAssets.ts";
import { registerErrorReplies } from "./registerErrorReplies.ts";
import { registerSecurity } from "./registerSecurity.ts";

export type ServerDependencies = {
  readonly config: ServerConfig;
  readonly pools: DatabasePools;
  readonly serveClientAssets: boolean;
  readonly logRequests: boolean;
};

type AppleMusicParts = { readonly services: AppleMusicServices | null; readonly runner: SyncRunner };

// Every route behind the session guard.
function registerSessionRoutes(scope: FastifyInstance, deps: ServerDependencies, appleMusic: AppleMusicParts): void {
  const db = deps.pools.app;
  registerLibraryRoutes(scope, db);
  registerCatalogRoutes(scope, db, deps.config.application);
  registerAppleMusicRoutes(withTypeBox(scope), appleMusic.services);
  registerConnectionRoutes(withTypeBox(scope), db, appleMusic.services);
  registerSyncRoutes(withTypeBox(scope), { db, ...appleMusic, startsPerMinute: deps.config.sync.startsPerMinute });
}

// Apple Music services, and the sync runner, whose tasks the server stops when it closes.
async function appleMusicPartsOf(app: FastifyInstance, deps: ServerDependencies): Promise<AppleMusicParts> {
  const services = await appleMusicServicesOf(deps.config);
  const runner = syncRunnerOf({ db: deps.pools.app, settings: deps.config.sync, log: app.log });
  app.addHook("onClose", () => runner.close());
  return { services, runner };
}

export async function buildServer(deps: ServerDependencies): Promise<FastifyInstance> {
  const app = Fastify({
    logger: deps.logRequests,
    requestIdHeader: "x-request-id",
    trustProxy: deps.config.production,
    ajv: { customOptions: { formats: { "partial-date": isPartialDate } } },
  });
  registerErrorReplies(app);
  await registerSecurity(app);
  const appleMusic = await appleMusicPartsOf(app, deps);
  registerObservability(app, deps.pools.app, appleMusic.runner.finishedCounts);
  const auth = createAuth(deps.config, deps.pools.auth);
  registerAuthRoutes(app, auth);
  await app.register(async (scope) => {
    registerSessionGuard(scope, auth);
    registerSessionRoutes(scope, deps, appleMusic);
  });
  if (deps.serveClientAssets) await registerClientAssets(app, deps.config.clientAssetsDir);
  return app;
}
