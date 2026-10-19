// Converts Fastify's incoming header record into Fetch API headers for Better Auth.
import type { IncomingHttpHeaders } from "node:http";

export function forwardHeaders(incoming: IncomingHttpHeaders): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(incoming)) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) headers.append(name, item);
  }
  return headers;
}
