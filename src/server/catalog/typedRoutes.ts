// The route-registration surface catalog routes use: Fastify with TypeBox request and
// response types, and the library scope of a request under /api/libraries/{libraryId}.
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { CatalogPageQuery } from "../../contracts/catalog/catalogPageQuerySchema.ts";
import type { PageRequest } from "../../db/catalog/catalogPage.ts";
import type { LibraryScope } from "../../db/withLibraryScope.ts";
import { sessionUserOf } from "../auth/registerSessionGuard.ts";

export function withTypeBox(scope: FastifyInstance) {
  return scope.withTypeProvider<TypeBoxTypeProvider>();
}

export type CatalogApp = ReturnType<typeof withTypeBox>;

export function libraryScopeOf(request: FastifyRequest, params: { readonly libraryId: string }): LibraryScope {
  return { userId: sessionUserOf(request).id, libraryId: params.libraryId };
}

export function pageRequestOf(query: CatalogPageQuery): PageRequest {
  return { query: query.query ?? "", offset: query.offset ?? 0, limit: query.limit ?? 50 };
}
