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

5. Start the server against the restored database; it applies any newer migrations before taking traffic.

## Rehearsals

| Date | Source | Result |
|---|---|---|
| 2026-10-19 | Development database, PostgreSQL 18.6, 3 migrations | Restored into a scratch database; user, library, membership, migration and policy counts matched (1, 2, 2, 3, 3); application role saw 0 libraries without a scope; scratch database dropped |

Rehearse again after any migration that adds a schema, role, function or policy, and record the result here.
