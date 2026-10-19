# Hosted-Postgres profile as applied

How each rule of the hosted-Postgres companion profile (programming Project wiki, `concepts/coding-standards-hosted-postgres`, updated 2026-08-16, read 2026-10-19) and the PLATFORM, MODEL and REMOTE profile is met in this repository. Status values: **planned** (designed, not built), **met** (built and checked), **exception** (recorded in `.architecture-exceptions.json`).

## Stack

| Rule | Application | Status |
|---|---|---|
| Node LTS | Node 24 LTS, pinned in `.nvmrc` and `engines` | planned |
| TypeScript strict | `strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` | planned |
| Fastify or Hono | Fastify 5 ([ADR-0006](../adr/0006-application-stack.md)) | planned |
| Postgres with a schema-first ORM and versioned migrations | Postgres 18, Drizzle ORM and Drizzle Kit | planned |
| Better Auth | Email and password for the owner; sign-up closed ([ADR-0008](../adr/0008-access-model.md)) | planned |
| Password hashing via the mandated `argon2` binding | Better Auth's hash and verify are replaced with `argon2` | planned |

## Database

| Rule | Application | Status |
|---|---|---|
| Migrations in the repository, applied automatically before traffic | `drizzle/`; the server applies pending migrations at start with the owner role | planned |
| Timestamp-prefixed migration names | Drizzle Kit `migrations.prefix = "timestamp"` | planned |
| Never edit an applied migration; one migration per commit | `npm run check:migrations` compares against `main` | planned |
| Rollback path per migration | A `-- rollback:` block in each migration file | planned |
| Parameterized queries only | Drizzle query builder; raw SQL only through tagged `sql` templates | planned |
| Statement timeouts and explicit pool limits | `statement_timeout` and pool `max` set per role in configuration | planned |
| Row-level security for user data | Every library table; `app_current_library()` checks membership | planned |
| Separate service role for administrative work | `apple_music_owner` for migrations; `apple_music_auth` for authentication tables | planned |
| No long transactions in HTTP handlers | Sync runs as a background job in batches | planned |

## Operations

| Rule | Application | Status |
|---|---|---|
| Secrets from the environment; `.env.example` committed | Database URLs, auth secret, token-encryption key, Apple credentials | planned |
| Environment separation | Distinct databases and secret sets for development, test and production | planned |
| Seed script | `npm run seed` creates the owner account and an empty library | planned |
| Backup and restore with a tested restore | `docs/ops/backup.md`; restore rehearsed into a scratch database | planned |
| Rate limiting on public endpoints | `@fastify/rate-limit`; stricter limits on sign-in | planned |
| Bot protection on public forms | Sign-up is closed; sign-in is rate-limited. Revisit before opening sign-up | planned |
| Structured logs with request IDs | Fastify's JSON logger with request ids | planned |
| Health and metrics endpoints | `/health` checks the database; `/metrics` reports counters | planned |

## Roles

| Rule | Application | Status |
|---|---|---|
| Only MODEL imports database clients | Checked by `npm run check:standards` | planned |
| Only REMOTE imports HTTP clients | The `fetch` global is permitted only in REMOTE | planned |
| PLATFORM-PURE allowlist; PLATFORM-AMBIENT from CONTROLLER only | `platform-pure-allowlist.json` | planned |
| Datastore ownership declared | `datastore-ownership.json` | met |
| Reserved names `client`, `stub`, `connector`, `gateway` not used for adapters | Checked by `npm run check:standards`; the browser deployment lives in `src/browser/` | planned |
