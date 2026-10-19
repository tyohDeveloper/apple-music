// Bridges /api/auth/* to Better Auth's Fetch API handler. Sign-in is rate-limited
// more strictly than the rest of the API (hosted-Postgres profile).
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { AppAuth } from "./createAuth.ts";
import { forwardHeaders } from "./forwardHeaders.ts";

function toFetchRequest(request: FastifyRequest): Request {
  const url = new URL(request.url, `${request.protocol}://${request.host}`);
  const hasBody = request.method !== "GET" && request.method !== "HEAD" && request.body !== undefined;
  return new Request(url, {
    method: request.method,
    headers: forwardHeaders(request.headers),
    ...(hasBody ? { body: JSON.stringify(request.body) } : {}),
  });
}

async function sendFetchResponse(reply: FastifyReply, response: Response): Promise<void> {
  reply.status(response.status);
  response.headers.forEach((value, name) => {
    if (name !== "set-cookie") reply.header(name, value);
  });
  const cookies = response.headers.getSetCookie();
  if (cookies.length > 0) reply.header("set-cookie", cookies);
  await reply.send(await response.text());
}

export function registerAuthRoutes(app: FastifyInstance, auth: AppAuth): void {
  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
    handler: async (request, reply) => sendFetchResponse(reply, await auth.handler(toFetchRequest(request))),
  });
}
