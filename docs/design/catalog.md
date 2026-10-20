# Catalog design (Phase 2)

Topic file for the curated catalog: tables, HTTP API and screens. Rules behind it are in [ADR-0009](../adr/0009-catalog-integrity.md); entities and invariants in [DOMAIN-MODEL.md](../DOMAIN-MODEL.md). Updated as each slice lands.

## Slices

Each slice is migrations, MODEL functions, contracts, routes, client screens and tests, committed and green in CI before the next.

| Slice | Contents | Status |
|---|---|---|
| A | Performers, names, relations | done 2026-10-19 |
| B | Recordings and recording credits | done 2026-10-19 |
| C | Albums, album credits, intended track lists, editions, edition tracks | next |
| D | Genres, aliases and assignments; external identifiers | planned |
| E | JSON export of a library | planned |

## HTTP API

All paths are under `/api/libraries/{libraryId}` and require a session. Lists take `query`, `offset` (0-indexed) and `limit` (at most 100) and return `{ items, total }`.

| Method and path | Purpose | Slice |
|---|---|---|
| `GET /performers` | Search performers by any of their names | A |
| `POST /performers` | Create a performer with its preferred name | A |
| `GET /performers/{id}` | Performer with names and relations in both directions | A |
| `PATCH /performers/{id}` | Edit kind, dates, area, disambiguation, notes | A |
| `DELETE /performers/{id}` | Delete with its names and relations; `409` while credited (from slice B) | A |
| `POST /performers/{id}/names` | Add a name; answers with the performer | A |
| `PATCH /performers/{id}/names/{nameId}` | Edit a name or make it preferred; answers with the performer | A |
| `DELETE /performers/{id}/names/{nameId}` | Remove a name; `409` if preferred or credited | A |
| `POST /performers/{id}/relations` | Relate this performer (subject) to another (object); answers with the performer | A |
| `DELETE /performers/{id}/relations/{relationId}` | Remove a relation; answers with the performer | A |
| `GET /recordings` | Search recordings by title or by any name of a credited performer; `performerId` limits the list to recordings crediting that performer | B |
| `POST /recordings`, `GET`/`PATCH`/`DELETE /recordings/{id}` | Create, read with credits and credit line, edit, delete with its credits; `409` while on a track list (from slice C) | B |
| `PUT /recordings/{id}/credits` | Replace the ordered credit list; answers with the recording. A credited name must be one of the credited performer's names | B |
| `GET /albums`, `POST /albums`, `GET`/`PATCH`/`DELETE /albums/{id}` | Albums | C |
| `PUT /albums/{id}/credits`, `PUT /albums/{id}/tracks` | Replace album credits; replace the intended track list | C |
| `POST /albums/{id}/editions`, `GET`/`PATCH`/`DELETE /editions/{id}`, `PUT /editions/{id}/tracks` | Editions and their tracks with inclusion | C |
| `GET /genres`, `POST /genres`, `PATCH`/`DELETE /genres/{id}`, `POST`/`DELETE /genres/{id}/aliases` | Genres and aliases | D |
| `PUT /{albums,recordings,performers}/{id}/genres` | Replace genre assignments | D |
| `PUT /{albums,editions,recordings,performers}/{id}/external-ids` | Replace external identifiers | D |
| `GET /export` | The library as one JSON document (`data/schemas/library-export.schema.json`) | E |

Errors use the Phase 1 envelope `{ error: { code } }`; new codes are `conflict-in-use`, `conflict-duplicate`, `conflict-preferred-name` (409) and `forbidden` (403). Every write first checks for the owner or editor role, so a viewer or non-member writing gets `403` rather than a `404` from rows that row-level security hides. A foreign key that names a missing row answers `404 not-found`.

The credit line shown for a recording joins its performing credits (roles in the `performer` family of `data/taxonomies/credit-roles.json`) in order, each under its credited name, with its join phrase; a credit without one is followed by a comma, and the last credit's join phrase is dropped (`src/credits/creditLineOf.ts`). Credit rows are keyed by position: the list is replaced whole, so a credit has no identity of its own.

## Screens

| Route | Screen |
|---|---|
| `/libraries/{id}` | Library home with sections for albums, recordings, performers and genres |
| `/libraries/{id}/performers` | Performer search and creation |
| `/libraries/{id}/performers/{performerId}` | Performer editor: details, names, relations |
| `/libraries/{id}/recordings`, `/libraries/{id}/recordings/{recordingId}` | Recording search; recording editor with credits |
| `/libraries/{id}/albums`, `/libraries/{id}/albums/{albumId}` | Album search; album editor with credits, intended track list and editions |
| `/libraries/{id}/genres` | Genre tree with aliases |
