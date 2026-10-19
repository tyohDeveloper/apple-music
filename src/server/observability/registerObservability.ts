// /health checks the database; /metrics reports response counts by status class.
import type { FastifyInstance } from "fastify";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { checkDatabaseHealth } from "../../db/checkDatabaseHealth.ts";
import { countStatusClass } from "../../metrics/countStatusClass.ts";
import { renderPrometheusCounters } from "../../metrics/renderPrometheusCounters.ts";

export function registerObservability(app: FastifyInstance, db: NodePgDatabase): void {
  let responses: Readonly<Record<string, number>> = {};
  app.addHook("onResponse", async (_request, reply) => {
    responses = countStatusClass(responses, reply.statusCode);
  });
  app.get("/health", async (_request, reply) => {
    const healthy = await checkDatabaseHealth(db);
    return reply.status(healthy ? 200 : 503).send({ status: healthy ? "ok" : "unavailable" });
  });
  app.get("/metrics", async (_request, reply) => {
    const body = renderPrometheusCounters("http_responses_total", "HTTP responses by status class.", "class", responses);
    return reply.type("text/plain; version=0.0.4").send(body);
  });
}
