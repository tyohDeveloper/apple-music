// Every failed /api request answers with { error: { code } } (src/contracts/errors).
// Validation failures are "validation"; catalog refusals keep their code (ADR-0009);
// anything unexpected is logged and hidden.
import type { FastifyError, FastifyInstance } from "fastify";
import { CatalogRefusal, type RefusalCode } from "../../db/catalog/catalogRefusal.ts";

const refusalStatus: Readonly<Record<RefusalCode, number>> = {
  "not-found": 404,
  forbidden: 403,
  validation: 400,
  "conflict-in-use": 409,
  "conflict-duplicate": 409,
  "conflict-preferred-name": 409,
};

export function registerErrorReplies(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof CatalogRefusal) return reply.status(refusalStatus[error.code]).send({ error: { code: error.code } });
    if (error.validation !== undefined) return reply.status(400).send({ error: { code: "validation" } });
    if (error.statusCode === 429) return reply.status(429).send({ error: { code: "rate-limited" } });
    request.log.error(error);
    return reply.status(500).send({ error: { code: "unexpected" } });
  });
  app.setNotFoundHandler((_request, reply) => reply.status(404).send({ error: { code: "not-found" } }));
}
