// Composition root: plugins, routes and the session guard. Returns the instance without
// listening so integration tests can use inject().
import Fastify, { type FastifyInstance } from "fastify";
import type { DatabasePools } from "../../db/createDatabasePools.ts";
import { isPartialDate } from "../../partial-dates/isPartialDate.ts";
import { createAuth } from "../auth/createAuth.ts";
import { registerAuthRoutes } from "../auth/registerAuthRoutes.ts";
import { registerSessionGuard } from "../auth/registerSessionGuard.ts";
import { registerCatalogRoutes } from "../catalog/registerCatalogRoutes.ts";
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

export async function buildServer(deps: ServerDependencies): Promise<FastifyInstance> {
  const app = Fastify({
    logger: deps.logRequests,
    requestIdHeader: "x-request-id",
    trustProxy: deps.config.production,
    ajv: { customOptions: { formats: { "partial-date": isPartialDate } } },
  });
  registerErrorReplies(app);
  await registerSecurity(app);
  registerObservability(app, deps.pools.app);
  const auth = createAuth(deps.config, deps.pools.auth);
  registerAuthRoutes(app, auth);
  await app.register(async (scope) => {
    registerSessionGuard(scope, auth);
    registerLibraryRoutes(scope, deps.pools.app);
    registerCatalogRoutes(scope, deps.pools.app);
  });
  if (deps.serveClientAssets) await registerClientAssets(app, deps.config.clientAssetsDir);
  return app;
}
