// Every catalog route, registered inside the session-guarded scope (buildServer.ts).
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { FastifyInstance } from "fastify";
import type { ExportWriter } from "../../db/catalog/export/libraryExportOf.ts";
import { registerAlbumListRoutes } from "./albums/registerAlbumListRoutes.ts";
import { registerAlbumRoutes } from "./albums/registerAlbumRoutes.ts";
import { registerEditionRoutes } from "./editions/registerEditionRoutes.ts";
import { registerExportRoutes } from "./export/registerExportRoutes.ts";
import { registerGenreAliasRoutes } from "./genres/registerGenreAliasRoutes.ts";
import { registerGenreAssignmentRoutes } from "./genres/registerGenreAssignmentRoutes.ts";
import { registerGenreRoutes } from "./genres/registerGenreRoutes.ts";
import { registerExternalIdRoutes } from "./identifiers/registerExternalIdRoutes.ts";
import { registerPerformerNameRoutes } from "./performers/registerPerformerNameRoutes.ts";
import { registerPerformerRelationRoutes } from "./performers/registerPerformerRelationRoutes.ts";
import { registerPerformerRoutes } from "./performers/registerPerformerRoutes.ts";
import { registerRecordingCreditRoutes } from "./recordings/registerRecordingCreditRoutes.ts";
import { registerRecordingRoutes } from "./recordings/registerRecordingRoutes.ts";
import { withTypeBox } from "./typedRoutes.ts";

export function registerCatalogRoutes(scope: FastifyInstance, db: NodePgDatabase, application: ExportWriter): void {
  const app = withTypeBox(scope);
  registerPerformerRoutes(app, db);
  registerPerformerNameRoutes(app, db);
  registerPerformerRelationRoutes(app, db);
  registerRecordingRoutes(app, db);
  registerRecordingCreditRoutes(app, db);
  registerAlbumRoutes(app, db);
  registerAlbumListRoutes(app, db);
  registerEditionRoutes(app, db);
  registerGenreRoutes(app, db);
  registerGenreAliasRoutes(app, db);
  registerGenreAssignmentRoutes(app, db);
  registerExternalIdRoutes(app, db);
  registerExportRoutes(app, db, application);
}
