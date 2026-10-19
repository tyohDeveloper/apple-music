# Hosted-Postgres profile as applied

How each rule of the hosted-Postgres companion profile (programming Project wiki, `concepts/coding-standards-hosted-postgres`, updated 2026-08-16, read 2026-10-19) and the PLATFORM, MODEL and REMOTE profile is met in this repository. Status values: **planned** (designed, not built), **met** (built and checked), **exception** (recorded in `.architecture-exceptions.json`).

## Stack

| Rule | Application | Status |
|---|---|---|
| Node LTS | Node 24 LTS, pinned in `.nvmrc` and `engines` | met |
| TypeScript strict | `strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` | met |
| Fastify or Hono | Fastify 5 ([ADR-0006](../adr/0006-application-stack.md)) | met |
| Postgres with a schema-first ORM and versioned migrations | Postgres 18, Drizzle ORM and Drizzle Kit | met |
| Better Auth | Email and password for the owner; sign-up closed ([ADR-0008](../adr/0008-access-model.md)) | met |
| Password hashing via the mandated `argon2` binding | Better Auth's hash and verify are replaced with `argon2`; `npm run check:bindings` resolves BND-0001 in the built server | met |

## Database

| Rule | Application | Status |
|---|---|---|
| Migrations in the repository, applied automatically before traffic | `drizzle/`; the server applies pending migrations at start with the owner role | met |
| Timestamp-prefixed migration names | Drizzle Kit `migrations.prefix = "timestamp"` | met |
| Never edit an applied migration; one migration per commit | `npm run check:migrations` compares against the previous branch head in CI, else `origin/main` | met |
| Rollback path per migration | A `-- rollback:` block in each migration file | met |
| Parameterized queries only | Drizzle query builder; raw SQL only through tagged `sql` templates | met |
| Statement timeouts and explicit pool limits | `statement_timeout` and pool `max` set per role in configuration | met |
| Row-level security for user data | Every library table; `app_current_library()` checks membership. Phase 1 tables: `library`, `library_member`; `npm run test:integration` proves isolation | met |
| Separate service role for administrative work | `apple_music_owner` for migrations; `apple_music_auth` for authentication tables | met |
| No long transactions in HTTP handlers | Request transactions are short and bounded by `idle_in_transaction_session_timeout`; Apple Music sync (Phase 3) runs as a background job in batches | met for Phase 1; sync planned |

## Operations

| Rule | Application | Status |
|---|---|---|
| Secrets from the environment; `.env.example` committed | Database URLs, auth secret, token-encryption key, Apple credentials | met |
| Environment separation | Distinct databases and secret sets for development, test and production | met |
| Seed script | `npm run seed` creates the owner account and an empty library | met |
| Backup and restore with a tested restore | [docs/ops/backup.md](../ops/backup.md); restore rehearsed into a scratch database 2026-10-19 | met |
| Rate limiting on public endpoints | `@fastify/rate-limit`; stricter limits on sign-in | met |
| Bot protection on public forms | Sign-up is closed; sign-in is rate-limited. Revisit before opening sign-up | met |
| Structured logs with request IDs | Fastify's JSON logger with request ids | met |
| Health and metrics endpoints | `/health` checks the database; `/metrics` reports counters | met |

## Roles

| Rule | Application | Status |
|---|---|---|
| Only MODEL imports database clients | Checked by `npm run check:standards` | met |
| Only REMOTE imports HTTP clients | The `fetch` global is permitted only in REMOTE | met |
| PLATFORM-PURE allowlist; PLATFORM-AMBIENT from CONTROLLER only | `platform-pure-allowlist.json` | met |
| Datastore ownership declared | `datastore-ownership.json` | met |
| Reserved names `client`, `stub`, `connector`, `gateway` not used for adapters | Checked by `npm run check:standards`; the browser deployment lives in `src/browser/` | met |
