# Backup and restore

The hosted-Postgres profile requires backups with a tested restore. One database holds every library (ADR-0003), so one dump covers everything: accounts, sessions, libraries, catalog data and the migration journal.

## Back up

Run as the owner role, which owns every table and is not subject to row-level security (policies are enabled, not forced, so the owner sees all rows):

```sh
pg_dump --format=custom --file=apple_music-$(date -u +%Y%m%d%H%M%S).dump \
  "postgres://apple_music_owner:<password>@<host>:5432/<database>"
```

The custom format is compressed and restores selectively with `pg_restore`. The dump holds password hashes and encrypted Apple Music user tokens; store it with the same care as the database.

## Restore

1. Create an empty database owned by the owner role (needs a role with `CREATEDB`):

   ```sh
   createdb --owner=apple_music_owner <scratch-or-target-database>
   ```

2. The three roles are cluster-wide; on a new cluster create them first with `npm run db:bootstrap`, pointed at the new cluster.
3. Restore as the owner role:

   ```sh
   pg_restore --exit-on-error --dbname="postgres://apple_music_owner:<password>@<host>:5432/<database>" <file>.dump
   ```

4. Check the copy before using it: row counts of `auth."user"`, `public.library` and `public.library_member` match the source; `drizzle.__drizzle_migrations` lists every migration in `drizzle/`; and the application role sees no rows without a user scope:

   ```sh
   psql "postgres://apple_music_app:<password>@<host>:5432/<database>" -Atc "select count(*) from public.library"
   # expect 0
   ```

5. Optionally, compare each library's JSON export (below) from the source and the copy; apart from `exportedAt` they are identical.
6. Start the server against the restored database; it applies any newer migrations before taking traffic.

## JSON export

Each library can also be downloaded as one JSON document: **Download the JSON export** on the library home, or `GET /api/libraries/{libraryId}/export` ([docs/design/catalog.md](../design/catalog.md#export)). It holds one library's curated catalog, without accounts, sessions or tokens, and validates against [docs/schemas/library-export.schema.json](../schemas/library-export.schema.json). It is a readable, portable copy for inspection and interchange; it does not replace the dump, and there is no import yet.

## Rehearsals

| Date | Source | Result |
|---|---|---|
| 2026-10-19 | Development database, PostgreSQL 18.6, 3 migrations | Restored into a scratch database; user, library, membership, migration and policy counts matched (1, 2, 2, 3, 3); application role saw 0 libraries without a scope; scratch database dropped |
| 2026-10-19 | Test database after the end-to-end suite, PostgreSQL 18.6, 14 migrations | Restored into a scratch database; counts matched for users, libraries, memberships, performers, performer names, recordings, credits, albums, editions, edition tracks, genres, external identifiers, migrations, policies, functions and triggers (1, 2, 2, 4, 6, 6, 2, 1, 1, 2, 2, 2, 14, 79, 6, 3); application role saw 0 libraries and 0 recordings without a scope; both libraries' JSON exports were identical from source and copy apart from `exportedAt`; scratch database dropped |

Rehearse again after any migration that adds a schema, role, function or policy, and record the result here.
