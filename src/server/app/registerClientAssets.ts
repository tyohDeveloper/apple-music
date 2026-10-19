// Serves the built single-page client and falls back to index.html for client routes.
// Unknown /api paths stay JSON 404s.
import fastifyStatic from "@fastify/static";
import type { FastifyInstance } from "fastify";
import path from "node:path";

export async function registerClientAssets(app: FastifyInstance, assetsDir: string): Promise<void> {
  await app.register(fastifyStatic, { root: path.resolve(assetsDir), wildcard: false, index: false });
  app.get("/*", { config: { rateLimit: false } }, async (request, reply) => {
    if (request.url.startsWith("/api/")) return reply.status(404).send({ error: { code: "not-found" } });
    return reply.type("text/html").sendFile("index.html");
  });
}
