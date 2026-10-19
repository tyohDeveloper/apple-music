// GET and POST /api/libraries: the libraries the signed-in user belongs to, and new
// libraries owned by that user (one per Apple ID, ADR-0003).
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { errorResponseSchema } from "../../contracts/errors/errorResponseSchema.ts";
import { createLibraryRequestSchema } from "../../contracts/libraries/createLibraryRequestSchema.ts";
import { libraryListResponseSchema } from "../../contracts/libraries/libraryListResponseSchema.ts";
import { librarySummarySchema } from "../../contracts/libraries/librarySummarySchema.ts";
import { createOwnedLibrary, listMemberLibraries } from "../../db/libraries/libraryMembership.ts";
import { withUserScope } from "../../db/withUserScope.ts";
import { collapseWhitespace } from "../../names/collapseWhitespace.ts";
import { sessionUserOf } from "../auth/registerSessionGuard.ts";

export function registerLibraryRoutes(scope: FastifyInstance, db: NodePgDatabase): void {
  const app = scope.withTypeProvider<TypeBoxTypeProvider>();
  app.get("/api/libraries", { schema: { response: { 200: libraryListResponseSchema } } }, async (request) => {
    const user = sessionUserOf(request);
    return { libraries: await withUserScope(db, user.id, listMemberLibraries) };
  });
  const createSchema = {
    body: createLibraryRequestSchema,
    response: { 201: librarySummarySchema, 400: errorResponseSchema },
  };
  app.post("/api/libraries", { schema: createSchema }, async (request, reply) => {
    const user = sessionUserOf(request);
    const label = collapseWhitespace(request.body.label);
    const created = await withUserScope(db, user.id, (tx) => createOwnedLibrary(tx, label));
    return reply.status(201).send(created);
  });
}
