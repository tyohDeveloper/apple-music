// Every failed /api request answers with { error: { code } } (src/contracts/errors).
// Validation failures are "validation"; anything unexpected is logged and hidden.
import type { FastifyError, FastifyInstance } from "fastify";

export function registerErrorReplies(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error.validation !== undefined) return reply.status(400).send({ error: { code: "validation" } });
    if (error.statusCode === 429) return reply.status(429).send({ error: { code: "rate-limited" } });
    request.log.error(error);
    return reply.status(500).send({ error: { code: "unexpected" } });
  });
  app.setNotFoundHandler((_request, reply) => reply.status(404).send({ error: { code: "not-found" } }));
}
