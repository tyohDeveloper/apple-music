# ADR-0002: Postgres is the system of record; JSON is the export format

## Status and date

Accepted, 2026-10-19. Owner: @tyohDeveloper. The owner asked whether JSON files or Postgres is better; this record states the recommendation and the reasons, and can be superseded.

## Context

The curated catalog is a graph: performers relate to performers; credits join performers to recordings and albums; editions and their tracks join albums to recordings; names, genres and external identifiers attach to all of them. Expected size, from the owner's earlier description of the library, is more than a thousand artists and many thousands of albums and EPs, so tens of thousands of tracks and credits. There will be one datastore per Apple ID and, later, more than one user. Cleanup operations such as merging two performers touch many rows and must either complete or leave nothing changed. The hosted-Postgres profile adopted in ADR-0001 names Postgres for hosted applications with persistent user state. Hosting platforms commonly do not persist local file writes; Replit, for example, states that the file system of a published app is not persistent and resets on each publish, and recommends a database ([Replit Docs](https://docs.replit.com/build/troubleshooting)).

## Decision

Postgres 18 is the system of record. Each library can also be exported as a single versioned JSON document for backup, inspection and interchange; import of that document is a later feature.

## Alternatives rejected and why

| Alternative | Why rejected |
|---|---|
| JSON files, one directory per Apple ID | No foreign keys or unique constraints, so a merge or rename can leave dangling references; no transactions, so an interrupted write can corrupt a file; whole files must be loaded to answer a query; concurrent edits need custom locking; schema changes need custom migration code; and many hosts discard file writes. |
| SQLite | Relational and transactional, but no row-level security for multi-user isolation, the same persistence problem on hosts that discard files, and it departs from the adopted hosted-Postgres profile. |
| A document database | Relationship integrity again becomes application code. |

## Consequences

- Integrity is enforced by the database: foreign keys, unique constraints, check constraints, partial unique indexes.
- Recursive queries can walk membership graphs; trigram indexes can support fuzzy name matching later.
- Raw Apple payloads are stored as `jsonb` in the mirror tables.
- Development and CI need a Postgres server; CI uses a pinned Postgres service container.
- Backups use `pg_dump`; the restore procedure is rehearsed (Phase 1).

## Evidence and approval

Hosted-Postgres profile (ADR-0001); [Replit Docs, troubleshooting](https://docs.replit.com/build/troubleshooting).

## Supersession

None.
