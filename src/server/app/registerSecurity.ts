// Security headers and the global rate limit. The Content-Security-Policy is data
// (data/security/content-security-policy.json) so the artifact verifier checks the same policy.
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import policy from "../../../data/security/content-security-policy.json" with { type: "json" };

export async function registerSecurity(app: FastifyInstance): Promise<void> {
  await app.register(helmet, {
    contentSecurityPolicy: { useDefaults: false, directives: policy.directives },
    crossOriginEmbedderPolicy: false,
  });
  await app.register(rateLimit, { global: true, max: 300, timeWindow: "1 minute" });
}
