# ADR-0006: Application stack

## Status and date

Accepted, 2026-10-19. Owner: @tyohDeveloper.

## Context

The application must be TypeScript (R-7), a web application first (R-26), on the hosted-Postgres profile (ADR-0001), with room for native clients later (R-25). The standards forbid choosing tools because another application uses them, require maintained, permissively licensed, broadly adopted libraries (§9.1), and limit each runtime library in the browser bundle to 5 kB gzip and 20 kB cumulative per release (§9.2). Versions below were current on 2026-10-19.

## Decision

| Concern | Choice | Reason |
|---|---|---|
| Runtime | Node 24 LTS | Current long-term-support line; Node 26 is not yet LTS |
| Language | TypeScript 6.0, strict | The standards checker is written against the compiler API of the 6.x line |
| HTTP server | Fastify 5 | Built-in JSON Schema validation and structured logging; maintained rate-limit, security-header and static-file plugins |
| Contracts | TypeBox with Fastify's type provider | One definition yields both the JSON Schema Fastify validates with and the TypeScript type, so request and response shapes are single-sourced |
| Datastore access | Drizzle ORM, Drizzle Kit, node-postgres | Schema-first TypeScript; row-level-security policies and composite foreign keys in the schema; generated SQL migrations with timestamp prefixes |
| Authentication | Better Auth, password hashing through `argon2` | Named by the hosted-Postgres profile; `argon2` is the mandated hashing binding |
| Developer-token signing | `jose` | Maintained, dependency-free JWT and ES256 implementation |
| Browser UI | Preact with Vite | Preact's runtime fits the 5 kB per-library budget; Vite is its maintained build tool and adds nothing to the bundle |
| Tests | Vitest for unit and integration tests; Playwright for end-to-end tests against the built server | |
| Dead-code scan | Knip | Unused files, exports and dependencies (§3.6) |
| Data validation | Ajv, at build time only | JSON Schema validation of `data/**` (§5.2) |

The browser bundle imports only Preact at runtime; contract types are imported as types and erased. Measured gzip costs are recorded in the Phase 1 change that adds the bundle (§9.7).

## Alternatives rejected and why

| Alternative | Why rejected |
|---|---|
| React | About ten times Preact's gzip size; exceeds the 5 kB per-library budget |
| Plain DOM code | A form-heavy editing interface would need more application code than a small component library replaces (§9.4) |
| Next.js, Remix or other full-stack frameworks | Bring their own server, routing and data layers, duplicate Fastify and Drizzle, and tie the HTTP API to one client |
| Hono | Optimized for edge runtimes; this application runs long background imports on a Node server |
| Express | No built-in validation; would need extra libraries Fastify already includes |
| Prisma | Separate schema language and query engine; row-level-security policies sit outside its schema |
| Kysely alone | Query builder without schema-driven migrations |
| Zod for server validation | Duplicates the validator Fastify already provides (§9.5) |
| TypeScript 7 | Adopt once the standards checker is moved to its programmatic interface |

## Consequences

- One HTTP API serves the web client now and any native client later.
- Every library added later records its measured cost and purpose (§9.7).
- A Postgres server is needed in development and CI.

## Evidence and approval

Owner request of 2026-10-19; standards §9.

## Supersession

None.
