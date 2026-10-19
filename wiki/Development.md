# Development

| Topic | Where |
|---|---|
| Agent and contributor contract | [AGENTS.md](https://github.com/tyohDeveloper/apple-music/blob/main/AGENTS.md) |
| Role and path mapping, boundaries | [docs/ARCHITECTURE.md](https://github.com/tyohDeveloper/apple-music/blob/main/docs/ARCHITECTURE.md) |
| Adopted standards and enforcement | [docs/CODING-STANDARDS.md](https://github.com/tyohDeveloper/apple-music/blob/main/docs/CODING-STANDARDS.md) |
| Decisions | [docs/adr/](https://github.com/tyohDeveloper/apple-music/blob/main/docs/adr) |
| Plan | [docs/PLAN.md](https://github.com/tyohDeveloper/apple-music/blob/main/docs/PLAN.md) |

## In brief

- TypeScript throughout: a Fastify server, a Postgres datastore through Drizzle, and a Preact single-page client built by Vite.
- The repository follows the Engineering Standards v2.2: domain logic in small pure functions with one export per file, strict layering, no user-visible literals in code, test identifiers on every interactive element, and data in schema-validated JSON.
- `npm run build` runs every check; CI runs the same build and then the end-to-end suite.
- Every library table is protected by row-level security; integration tests prove one library cannot see another.

## Editing this wiki

Edit the Markdown files in [`wiki/`](https://github.com/tyohDeveloper/apple-music/blob/main/wiki) and commit; a workflow publishes them here.
