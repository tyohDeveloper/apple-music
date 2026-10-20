# Catalog design (Phase 2)

Topic file for the curated catalog: tables, HTTP API and screens. Rules behind it are in [ADR-0009](../adr/0009-catalog-integrity.md); entities and invariants in [DOMAIN-MODEL.md](../DOMAIN-MODEL.md). Updated as each slice lands.

## Slices

Each slice is migrations, MODEL functions, contracts, routes, client screens and tests, committed and green in CI before the next.

| Slice | Contents | Status |
|---|---|---|
| A | Performers, names, relations | done 2026-10-19 |
| B | Recordings and recording credits | done 2026-10-19 |
| C | Albums, album credits, intended track lists, editions, edition tracks | done 2026-10-19 |
| D | Genres, aliases and genre assignments | done 2026-10-19 |
| E | External identifiers | done 2026-10-19 |
| F | JSON export of a library | done 2026-10-19 |

With slice F, Phase 2 is complete.

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
| `GET /albums` | Search albums by title or by any name of a performer credited on the album or on one of its intended tracks; `performerId` limits the list to albums crediting that performer on the album or a track, `recordingId` to albums whose intended track list plays that recording | C |
| `POST /albums`, `GET`/`PATCH`/`DELETE /albums/{id}` | Create, read with credits, credit line, intended track list and editions, edit, delete with its credits and track list; `409` while it has editions | C |
| `PUT /albums/{id}/credits` | Replace the ordered album credits, under the rules for recording credits; answers with the album | C |
| `PUT /albums/{id}/tracks` | Replace the intended track list, `{ discs: [{ tracks: [{ recordingId, title?, label? }] }] }`; every track plays a recording; answers with the album | C |
| `POST /albums/{id}/editions` | Create an edition of the album | C |
| `GET`/`PATCH`/`DELETE /editions/{id}` | Read with its album and tracks, edit (an `albumId` moves the edition to another album), delete with its tracks | C |
| `PUT /editions/{id}/tracks` | Replace the edition's tracks, `{ discs: [{ tracks: [{ title, recordingId?, inclusion }] }] }`; a track may name no recording yet; answers with the edition | C |
| `GET /genres` | Search genres by name or alias, ordered by path so that the list reads as the tree | D |
| `POST /genres`, `GET`/`PATCH`/`DELETE /genres/{id}` | Create with a name, parent and notes; read with path, aliases, subgenres and use counts; edit or move (`parentId: null` makes it top-level); delete with its aliases; `409` while it has subgenres or uses | D |
| `POST /genres/{id}/aliases`, `DELETE /genres/{id}/aliases/{aliasId}` | Add or remove an alias; answers with the genre | D |
| `PUT /{albums,recordings,performers}/{id}/genres` | Replace the ordered genres, `{ genreIds }`; answers with the album, recording or performer | D |
| `genreId` on `GET /albums`, `GET /recordings`, `GET /performers` | Limits the list to entities carrying that genre | D |
| `PUT /{performers,albums,editions,recordings}/{id}/external-ids` | Replace the identifiers, `{ externalIds: [{ namespace, value }] }`, at most 50; each value is normalized and must have the form its namespace uses for that kind of entity, else `400 invalid-external-id`; answers with the entity | E |
| `GET /export` | The library as one JSON document (`data/schemas/library-export.schema.json`) | F |

Errors use the Phase 1 envelope `{ error: { code } }`; new codes are `conflict-in-use`, `conflict-duplicate`, `conflict-preferred-name`, `conflict-genre-cycle` (409, from slice D) and `forbidden` (403). Every write first checks for the owner or editor role, so a viewer or non-member writing gets `403` rather than a `404` from rows that row-level security hides. A foreign key that names a missing row answers `404 not-found`.

The credit line shown for a recording joins its performing credits (roles in the `performer` family of `data/taxonomies/credit-roles.json`) in order, each under its credited name, with its join phrase; a credit without one is followed by a comma, and the last credit's join phrase is dropped (`src/credits/creditLineOf.ts`). Credit rows are keyed by position: the list is replaced whole, so a credit has no identity of its own.

Track lists are replaced whole in the same way. Disc index and position follow from the order of the request; a disc holds 1 to 300 tracks, and a list at most 100 discs. A recording on any album's or edition's track list cannot be deleted, an album with editions cannot be deleted, and a performer or performer name credited on an album cannot be deleted; each answers `409 conflict-in-use`. A count shown in a list (an album's tracks and editions, an edition's tracks) is a correlated subquery whose outer columns are named with their table (`src/db/catalog/outerColumn.ts`), because Drizzle leaves table names off the select list of a single-table query.

## Genres

| Table | Holds | Rules |
|---|---|---|
| `genre` | Name and its match key, optional parent, notes | Sibling names are unique (`unique nulls not distinct` on library, parent and match key, so two top-level genres cannot share a name either). A genre is never its own ancestor: a trigger refuses the move with `409 conflict-genre-cycle`, and an advisory lock per library serializes moves so that two concurrent moves cannot close a loop. A genre with subgenres or uses cannot be deleted |
| `genre_alias` | Another name for a genre, such as an Apple Music genre name or a spelling | An alias names one genre in a library (unique match key); deleted with its genre |
| `album_genre`, `recording_genre`, `performer_genre` | An entity's genres in order; the first is its main genre | Replaced whole; a genre appears once per entity; at most 20; deleted with the entity |

A genre's path is its ancestors from the top down. The genre list is computed with a recursive query and ordered by the path of match keys under the `C` collation, so each genre follows its parent and siblings sort by name. Search matches a genre's name or any alias. Genres on an album describe the album, genres on a recording the recording, and genres on a performer the performer's work in general; none is inferred from another. Imports (Phase 3) resolve an Apple Music genre name through the aliases first, then through a genre name that is unique in the library.

## External identifiers

Namespaces are a taxonomy, `data/taxonomies/external-id-namespaces.json`, whose families are the issuing authorities. Which namespaces each kind of entity takes, the form of a value and the page it links to are data, `data/identifiers/external-id-formats.json` (schema `data/schemas/external-id-formats.schema.json`); `src/identifiers` reads them.

| Namespace | Performer | Album | Edition | Recording | Value |
|---|---|---|---|---|---|
| `apple-library` | Library artist id | | Library album id | Library song id | Apple's opaque library id. Apple does not document its form: library song ids seen in [Apple's developer forums](https://developer.apple.com/forums/tags/apple-music-api?page=3) start with `i.`, and [third-party notes](https://github.com/kaosZL/zl-music-tv/blob/main/docs/apple-music-api.md) give `l.` for albums and `r.` for artists. Letters, digits, `.`, `_` and `-` are accepted |
| `apple-catalog` | Artist id | | Album id | Song id | Digits |
| `isrc` | | | | Yes | Twelve characters, such as `USSM15900113`; spaces, hyphens and lower case are accepted and removed |
| `upc` | | | Yes | | 12 to 14 digits: UPC-A, EAN-13 or GTIN-14 |
| `musicbrainz` | Artist | Release group | Release | Recording | MBID, a UUID, stored in lower case |
| `discogs` | Artist | Master | Release | | Digits |
| `wikidata` | Item | Item | | Item | `Q` and digits |

| Table | Holds | Rules |
|---|---|---|
| `performer_external_id`, `album_external_id`, `edition_external_id`, `recording_external_id` | Namespace and value per entity | Unique per entity; indexed by library, namespace and value for lookups; deleted with the entity. The same value may sit on two entities: duplicates are what the Phase 4 merge workflow looks for |

An entity's identifiers are read in order of namespace code, then value. The list is replaced whole; the server trims, normalizes and checks every value, drops repeats, and refuses the whole list with `400 invalid-external-id` if one value lacks its form.

The performer, album, edition and recording editors each have an identifiers panel: choose a namespace, enter a value, add; remove; each change is saved at once. The browser checks a value with the same rules and data before sending (`normalizedExternalIdOf`), so a malformed value is flagged on its field and kept for correction; the form clears once the identifier is saved. A value whose namespace has a page (MusicBrainz, Discogs, Wikidata) links to it.

## Export

`GET /api/libraries/{libraryId}/export` answers a library's whole curated catalog as one JSON document, sent as a download named after the library and the day (`Content-Disposition: attachment; filename="<label>-<yyyy-mm-dd>.json"`). Any member may export, viewers included; anyone else gets 404, as for every read. [ADR-0002](../adr/0002-postgres-system-of-record.md) names this document as the format for backup, inspection and interchange beside `pg_dump` ([backup.md](../ops/backup.md)).

| Question | Options | Choice and reason |
|---|---|---|
| Shape | (a) One array per table, as stored; (b) each entity with the rows it owns nested inside it, other entities referred to by id | (b): it reads like the domain model, owned rows (names, credits, tracks, aliases, identifiers, an album's editions) stay with their owner, and ids keep references exact for a later import |
| Schema | (a) A hand-written JSON Schema as the source; (b) a TypeBox contract as the source, as for every other response, with the JSON Schema generated into `docs/schemas/library-export.schema.json` and a unit test that fails when the file is stale | (b): one source of truth; the checked-in file lets a backup be validated without running the application |
| Version | (a) A four-part format version on its own track; (b) an integer `formatVersion` raised only when a reader of the previous format could misread a new document, with the four-part version of the application that wrote it alongside | (b): readers need one question answered, whether they understand the document; additions that old readers can ignore leave it unchanged, and the application version records exactly what wrote it |
| Delivery | (a) Built in memory and sent in one response; (b) a background job that writes a file to fetch later | (a): one owner, at most tens of thousands of recordings (tens of megabytes); a route limit of 6 exports a minute keeps it from loading the server. Streaming is the change to make if a library outgrows that |
| Consistency | (a) Independent reads; (b) one `repeatable read, read only` transaction | (b): the document is one snapshot even while edits continue |
| Order | (a) Whatever the database returns; (b) entities by creation time then id, owned rows in their stored order | (b): two exports of an unchanged library differ only in `exportedAt`, so backups compare cleanly |

```text
format             "apple-music-library-export"
formatVersion      1
exportedAt         time of the snapshot
application        name and four-part version of the writer
library            id, label, storefront, createdAt, updatedAt
genres[]           id, parentId, name, notes, aliases[] { id, name }, createdAt, updatedAt
performers[]       id, kind, began, ended, area, disambiguation, notes,
                   names[] { id, name, sortName, kind, locale, validFrom, validTo, isPreferred },
                   genreIds[], externalIds[] { namespace, value }, createdAt, updatedAt
performerRelations[] id, subjectId, objectId, kind, roles[], began, ended, notes
recordings[]       id, title, versionNote, kind, recordedFrom, recordedTo, venue, durationMs, notes,
                   credits[] { performerId, creditedNameId, role, joinPhrase, instruments[] },
                   genreIds[], externalIds[], createdAt, updatedAt
albums[]           id, title, kind, released, label, notes, credits[],
                   tracks[] { discIndex, position, recordingId, title, label }, genreIds[], externalIds[],
                   editions[] { id, title, kind, released, notes,
                                tracks[] { discIndex, position, title, recordingId, inclusion },
                                externalIds[], createdAt, updatedAt },
                   createdAt, updatedAt
```

Taxonomy values are written as their codes (`group`, `primary`), not display names, so a document is the same whatever the interface language. Match keys are derived and left out. Accounts, memberships and sessions are not catalog data and are not exported. The Apple mirror and change outbox (Phases 3 and 5) join the document as added fields when they exist. Importing a document is not part of this slice.

Measured when the slice was built: a synthetic library of 20,000 recordings with 40,000 credits and 2,000 albums, each with one edition of ten tracks, exported as 19 MB in 1.6 seconds through the route, response serialization included, on the development machine.

Build order: snapshot transaction option on the library scope; MODEL reads in bulk per entity type (`src/db/catalog/export/`), grouped in memory with `Map.groupBy`, never one query per entity; contracts in `src/contracts/export/`; the route; the generated schema file and its staleness test; an integration test that validates an export against the schema, resolves every id reference and finds nothing from another library; a download link on the library home; an end-to-end test that downloads and reads the document; a wiki page.

## Screens

| Route | Screen |
|---|---|
| `/libraries/{id}` | Library home with sections for albums, recordings, performers and genres, and a link that downloads the library's JSON export |
| `/libraries/{id}/performers` | Performer search and creation |
| `/libraries/{id}/performers/{performerId}` | Performer editor: details, names, relations, the recordings and albums crediting the performer |
| `/libraries/{id}/recordings`, `/libraries/{id}/recordings/{recordingId}` | Recording search; recording editor with credits and the albums whose track lists play it |
| `/libraries/{id}/albums`, `/libraries/{id}/albums/{albumId}` | Album search; album editor with details, credits, intended track list and editions |
| `/libraries/{id}/editions/{editionId}` | Edition editor: details, and tracks with their inclusion; editions are reached from their album |
| `/libraries/{id}/genres` | Genre search, listed in tree order with each genre's path |
| `/libraries/{id}/genres/{genreId}` | Genre editor: name, parent, notes, aliases, subgenres, and the albums, recordings and performers carrying it |

The album, recording and performer editors each gain a genres panel: find a genre, add it, reorder or remove; each change is saved at once.
