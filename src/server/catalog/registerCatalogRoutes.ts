// Every catalog route, registered inside the session-guarded scope (buildServer.ts).
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { FastifyInstance } from "fastify";
import { registerPerformerNameRoutes } from "./performers/registerPerformerNameRoutes.ts";
import { registerPerformerRelationRoutes } from "./performers/registerPerformerRelationRoutes.ts";
import { registerPerformerRoutes } from "./performers/registerPerformerRoutes.ts";
import { registerRecordingCreditRoutes } from "./recordings/registerRecordingCreditRoutes.ts";
import { registerRecordingRoutes } from "./recordings/registerRecordingRoutes.ts";
import { withTypeBox } from "./typedRoutes.ts";

export function registerCatalogRoutes(scope: FastifyInstance, db: NodePgDatabase): void {
  const app = withTypeBox(scope);
  registerPerformerRoutes(app, db);
  registerPerformerNameRoutes(app, db);
  registerPerformerRelationRoutes(app, db);
  registerRecordingRoutes(app, db);
  registerRecordingCreditRoutes(app, db);
}
