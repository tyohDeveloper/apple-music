// Every route registered inside a guarded scope needs a session; the signed-in user is
// attached to the request for library scoping. No authorization happens in the browser.
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { SessionUser } from "../../contracts/session/sessionUser.ts";
import type { AppAuth } from "./createAuth.ts";
import { forwardHeaders } from "./forwardHeaders.ts";

declare module "fastify" {
  interface FastifyRequest {
    sessionUser: SessionUser | null;
  }
}

export function sessionUserOf(request: FastifyRequest): SessionUser {
  if (request.sessionUser === null) throw new Error("Route registered outside the session guard");
  return request.sessionUser;
}

export function registerSessionGuard(scope: FastifyInstance, auth: AppAuth): void {
  scope.decorateRequest("sessionUser", null);
  scope.addHook("preHandler", async (request, reply) => {
    const session = await auth.api.getSession({ headers: forwardHeaders(request.headers) });
    if (session === null) return reply.status(401).send({ error: { code: "unauthorized" } });
    request.sessionUser = { id: session.user.id, name: session.user.name, email: session.user.email };
    return undefined;
  });
}
