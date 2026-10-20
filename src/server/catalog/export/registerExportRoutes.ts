// GET /export answers the library's curated catalog as one JSON document, sent as a download
// named after the library and the day (docs/design/catalog.md, Export). Any member may export;
// anyone else gets 404. Limited to 6 a minute, since each export reads the whole library.
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { libraryParamsSchema } from "../../../contracts/catalog/libraryParamsSchema.ts";
import { libraryExportSchema } from "../../../contracts/export/libraryExportSchema.ts";
import { requireFound } from "../../../db/catalog/catalogRefusal.ts";
import { libraryExportOf, type ExportWriter } from "../../../db/catalog/export/libraryExportOf.ts";
import { exportFileNameOf } from "../../../export/exportFileNameOf.ts";
import { libraryScopeOf, type CatalogApp } from "../typedRoutes.ts";

const schema = { params: libraryParamsSchema, response: { 200: libraryExportSchema } };

export function registerExportRoutes(app: CatalogApp, db: NodePgDatabase, application: ExportWriter): void {
  app.get("/api/libraries/:libraryId/export", { schema, config: { rateLimit: { max: 6, timeWindow: "1 minute" } } }, async (request, reply) => {
    const document = requireFound(await libraryExportOf(db, libraryScopeOf(request, request.params), application));
    const fileName = exportFileNameOf(document.library.label, document.exportedAt);
    return reply.header("content-disposition", `attachment; filename="${fileName}"`).send(document);
  });
}
