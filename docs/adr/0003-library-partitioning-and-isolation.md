# ADR-0003: One database, library-scoped rows, row-level security

## Status and date

Accepted, 2026-10-19. Owner: @tyohDeveloper.

## Context

There is a datastore for each Apple ID. Initially there is exactly one user; more users must be possible later, and a user may attach more than one Apple ID (for example a family member's). The Apple Music API does not return an Apple ID or any stable account identifier for an authorized user; the Music User Token is opaque and expires.

## Decision

1. A **library** is the datastore for one Apple ID. The owner names it (for example with the Apple ID's email address) when attaching it; MusicKit authorization then links an Apple Music account to it.
2. All libraries share one database. Every curated, mirror, sync and outbox row carries `library_id`. Foreign keys between library tables are composite — `(library_id, id)` — so a reference can never cross libraries.
3. `library_member` links users to libraries with a role (`owner`, `editor`, `viewer`).
4. Row-level security on every library table uses the policy `library_id = app_current_library()`. The function returns the library named by the transaction setting `app.library_id` only if the user named by `app.user_id` is a member, so isolation holds even when an application-level check is missing.
5. Requests run as the `apple_music_app` database role, which does not own the tables and is subject to row-level security. Migrations run as `apple_music_owner`.
6. Because the API cannot confirm which Apple account is authorized, every sync compares the fetched library's item ids with the stored ones; a run that finds no overlap with a non-empty stored library stops in `needs-confirmation` instead of recording removals.

## Alternatives rejected and why

| Alternative | Why rejected |
|---|---|
| A database per Apple ID | Multiplies migrations, connection pools and backups; contradicts one application, one database. |
| A schema per Apple ID | Migrations must run per schema; the ORM's static schema model does not fit dynamic schemas; shared reference data becomes awkward. |
| Application-level filtering only | One forgotten `where` clause exposes another library; the hosted profile requires row-level security for user data. |
| Identify the library by the Music User Token | The token changes on reauthorization and expires. |

## Consequences

- Every query runs inside a transaction that sets `app.user_id` and `app.library_id`; one MODEL function owns that.
- Integration tests prove that a member of one library reads nothing from another.
- Sign in with Apple, if adopted later, can bind a library to a stable Apple account identifier.

## Evidence and approval

Owner request of 2026-10-19; hosted-Postgres profile; [Apple Music API: user authentication](https://developer.apple.com/documentation/applemusicapi/user-authentication-for-musickit).

## Supersession

None.
