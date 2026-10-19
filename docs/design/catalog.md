# Catalog design (Phase 2)

Topic file for the curated catalog: tables, HTTP API and screens. Rules behind it are in [ADR-0009](../adr/0009-catalog-integrity.md); entities and invariants in [DOMAIN-MODEL.md](../DOMAIN-MODEL.md). Updated as each slice lands.

## Slices

Each slice is migrations, MODEL functions, contracts, routes, client screens and tests, committed and green in CI before the next.

| Slice | Contents | Status |
|---|---|---|
| A | Performers, names, relations | in progress |
| B | Recordings and recording credits | planned |
| C | Albums, album credits, intended track lists, editions, edition tracks | planned |
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
| `DELETE /performers/{id}` | Delete; `409` while credited or related | A |
| `POST /performers/{id}/names` | Add a name | A |
| `PATCH /performers/{id}/names/{nameId}` | Edit a name or make it preferred | A |
| `DELETE /performers/{id}/names/{nameId}` | Remove a name; `409` if preferred or credited | A |
| `POST /performers/{id}/relations` | Relate this performer (subject) to another (object) | A |
| `DELETE /performers/{id}/relations/{relationId}` | Remove a relation | A |
| `GET /recordings`, `POST /recordings`, `GET`/`PATCH`/`DELETE /recordings/{id}` | Recordings | B |
| `PUT /recordings/{id}/credits` | Replace the ordered credit list | B |
| `GET /albums`, `POST /albums`, `GET`/`PATCH`/`DELETE /albums/{id}` | Albums | C |
| `PUT /albums/{id}/credits`, `PUT /albums/{id}/tracks` | Replace album credits; replace the intended track list | C |
| `POST /albums/{id}/editions`, `GET`/`PATCH`/`DELETE /editions/{id}`, `PUT /editions/{id}/tracks` | Editions and their tracks with inclusion | C |
| `GET /genres`, `POST /genres`, `PATCH`/`DELETE /genres/{id}`, `POST`/`DELETE /genres/{id}/aliases` | Genres and aliases | D |
| `PUT /{albums,recordings,performers}/{id}/genres` | Replace genre assignments | D |
| `PUT /{albums,editions,recordings,performers}/{id}/external-ids` | Replace external identifiers | D |
| `GET /export` | The library as one JSON document (`data/schemas/library-export.schema.json`) | E |

Errors use the Phase 1 envelope `{ error: { code } }`; new codes are `conflict-in-use`, `conflict-preferred-name` and `forbidden`.

## Screens

| Route | Screen |
|---|---|
| `/libraries/{id}` | Library home with sections for albums, recordings, performers and genres |
| `/libraries/{id}/performers` | Performer search and creation |
| `/libraries/{id}/performers/{performerId}` | Performer editor: details, names, relations |
| `/libraries/{id}/recordings`, `/libraries/{id}/recordings/{recordingId}` | Recording search; recording editor with credits |
| `/libraries/{id}/albums`, `/libraries/{id}/albums/{albumId}` | Album search; album editor with credits, intended track list and editions |
| `/libraries/{id}/genres` | Genre tree with aliases |
