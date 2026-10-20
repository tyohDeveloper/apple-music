# Apple Music import design (Phase 3)

Plan of record for Phase 3, checkpointed before building. The boundary is fixed by [ADR-0005](../adr/0005-apple-music-integration-boundary.md): the server signs developer tokens and calls the Apple Music API, MusicKit on the Web runs only to obtain the Music User Token, reads land in the Apple mirror, and the curated catalog is built from the mirror and never overwritten by it.

Exit criteria ([PLAN.md](../PLAN.md)): sync exercised against a contract-faithful Apple Music fake in CI; a live check by the owner with real credentials.

**Progress:** slices G (connection) and H (mirror) are built; slice I (import) is next. [Slice G as built](#slice-g-as-built) and [Slice H as built](#slice-h-as-built) record where the build settled details this plan left open or changed them.

## What Apple provides

Read 2026-10-19.

| Fact | Source |
|---|---|
| Developer tokens are ES256 JWTs with `kid` (10-character key id) in the header and `iss` (10-character Team ID), `iat` and `exp` in the payload; `exp` may be at most 15,777,000 seconds (six months) after the current time; an optional `origin` array is recommended for web clients; requests send `Authorization: Bearer <token>` | [Generating developer tokens](https://developer.apple.com/documentation/applemusicapi/generating-developer-tokens) |
| Library requests also send the Music User Token in the `Music-User-Token` header | [User authentication for MusicKit](https://developer.apple.com/documentation/applemusicapi/user-authentication-for-musickit) |
| `GET /v1/me/storefront` answers the user's storefront and needs the Music User Token | [Get a user's storefront](https://developer.apple.com/documentation/applemusicapi/get-a-user's-storefront.md) |
| Library lists take `include`, `l`, `limit`, `offset` and `extend`; a response with more objects than the limit carries a `next` subpath; Apple's pages state no maximum `limit` for library lists | [Get all library songs](https://developer.apple.com/documentation/applemusicapi/get-all-library-songs), [Fetching resources by page](https://developer.apple.com/documentation/applemusicapi/fetching-resources-by-page) |
| A library song relates to its library albums and artists (at most 10 each) and to its catalog song, when known | [LibrarySongs.Relationships](https://developer.apple.com/documentation/applemusicapi/librarysongs/relationships-data.dictionary) |
| A library album's tracks are available only when fetching that one album (up to 300); its catalog album, when known, through `catalog` | [LibraryAlbums.Relationships](https://developer.apple.com/documentation/applemusicapi/libraryalbums/relationships-data.dictionary) |
| Catalog songs are fetched by id, at most 300 per request, and carry `isrc`, `composerName`, `workName`, `movementName`, `movementNumber`, `movementCount`, `discNumber`, `trackNumber`, `releaseDate` and `genreNames` | [Get multiple catalog songs by ID](https://developer.apple.com/documentation/applemusicapi/get-multiple-catalog-songs-by-id), [Songs.Attributes](https://developer.apple.com/documentation/applemusicapi/songs/attributes-data.dictionary) |
| Catalog albums are fetched by id, at most 100 per request, and carry `upc`, `recordLabel`, `trackCount`, `isCompilation`, `isSingle`, `isComplete` and `releaseDate` | [Get multiple catalog albums](https://developer.apple.com/documentation/applemusicapi/get-multiple-catalog-albums), [Albums.Attributes](https://developer.apple.com/documentation/applemusicapi/albums/attributes-data.dictionary) |
| MusicKit on the Web loads from `https://js-cdn.music.apple.com/musickit/v3/musickit.js`, signals `musickitloaded`, is configured with a developer token and an app name, and `authorize()` resolves with the Music User Token | [Getting started](https://js-cdn.music.apple.com/musickit/v3/docs/?path=/story/get-started--page), [MusicKit instance](https://js-cdn.music.apple.com/musickit/v3/docs/index.html?path=/docs/reference-javascript-musickit-instance--page) |

## Decisions

| Question | Options | Choice and reason |
|---|---|---|
| Where a sync runs | (a) A background task in the server process, its state in `sync_run`; (b) a Postgres-backed job queue library (pg-boss, Graphile Worker); (c) a separate worker process | (a): one instance, one kind of job, at most one run per library. At start the server marks runs left `running` as `interrupted`; the owner starts a new one. (b) brings its own schema, roles and migrations for a single job kind; revisit with more users or instances |
| Catalog enrichment | (a) Rely on `include=catalog` returning full catalog objects inside library pages; (b) take catalog ids from the `catalog` relationship (or `playParams.catalogId`) and fetch catalog songs and albums by id in batches | (b): works whether or not included relationships carry attributes, and uses the documented batch sizes (300 songs, 100 albums per request) |
| Which album a song is on | (a) The song's `albums` relationship, included in the song pages; (b) fetching every library album by id for its tracks | (a): no request per album |
| Storing the Music User Token | (a) AES-256-GCM in the application (`node:crypto`, PLATFORM), key from `TOKEN_ENCRYPTION_KEY`, key version stored; (b) `pgcrypto`, with the key passed in SQL; (c) a cloud key service | (a): the key never reaches the database; (c) depends on the unresolved host (Q-1) |
| What links an imported entry to its Apple item | (a) The `apple-library` external identifiers alone; (b) a link table written only by the import, with external identifiers also written for display | (b): identifiers are owner-editable, and removing one must not make the next import create the entry again. Phase 4 merges move links |
| Re-import | (a) Create curated entries only for Apple items not linked yet, never change linked ones; (b) update linked entries from Apple | (a), as ADR-0005 requires: Apple-side changes show as mirror differences for review in Phase 4 |
| Mapping rules (title markers, credit separators, ensemble words) | (a) Data files with JSON Schemas, read by PURE planners; (b) constants in code | (a): the rules will grow as real libraries show cases; data files are reviewable and each rule is exercised by fixtures |
| A different Apple account on reconnection | (a) Stop in `needs-confirmation` when a run's listing shares no library ids with the stored mirror; (b) accept and record removals | (a), as [ARCHITECTURE.md](../ARCHITECTURE.md#import-pipeline) states; the owner then replaces the mirror or cancels |
| Testing without Apple | (a) A contract-faithful fake server built from Apple's documented shapes, with fixture libraries; (b) responses recorded from the owner's library | (a): (b) would publish the owner's library in a public repository |

## Slices

| Slice | Status | Contents |
|---|---|---|
| G | Built 2026-10-19 | Connection: developer tokens (`jose`, ES256, cached, one with the `origin` claim for MusicKit and one without for the server); token cipher; `apple_music_connection`; routes to read Apple's configuration state, get the browser developer token, and connect or disconnect a library (owner only; the token is checked with `/v1/me/storefront` before it is stored); the REMOTE adapter with timeouts, `Retry-After` on 429, backoff on 5xx and `needs-reauthorization` on 401 or 403; the fake; the connection screen loading MusicKit from Apple's CDN; the MusicKit script recorded as a binding |
| H | Built 2026-10-19 | Mirror: `sync_run`, `apple_library_item`, `apple_catalog_item`; the run as a background task paging songs (with `albums`, `artists` and `catalog`), albums, artists and playlists at `limit=100` and following `next`, upserting each page in its own transaction, then fetching catalog songs and albums by id, then marking items not seen as removed unless the guard stops the run; a progress endpoint polled by the screen; sync counters in `/metrics` |
| I | Next | Import: PURE planners over the mirror (performers and credits, albums and editions, recordings, track inclusion, genres, identifiers) with rule data in `data/import/`; MODEL applies the plan in batches through the link table; counts and unmapped Apple genre names recorded on the run |
| J | Planned | Owner runbook (`docs/ops/apple-music.md`: MusicKit key, environment, connecting, first import), wiki pages, and the live check |

## Slice G as built

| Topic | As built |
|---|---|
| Developer tokens | Signed with `jose` (ES256, `kid`, `iss`), 12 hours of life, renewed an hour before expiry. The browser's token carries `origin` set to `BETTER_AUTH_URL` and is served by `GET /api/apple-music/developer-token` to signed-in users only, with `Cache-Control: no-store` |
| Stored token | `apple_music_connection` holds one sealed value per library, `v<key version>.<nonce>.<tag>.<ciphertext>` in base64url (AES-256-GCM, 12-byte nonce, the library id as associated data, so a value copied to another library does not open), with who connected it and when. One key, version 1, from `TOKEN_ENCRYPTION_KEY`; opening already looks keys up by version, and slice J's runbook adds the setting for the earlier key during a rotation. Until then, changing the key means connecting each library again |
| Storefront | Stored on `library.storefront`, not on the connection: catalog ids are storefront-specific, so the library keeps it after a disconnection, and a reconnection replaces it with what Apple reports |
| Reauthorization | No status column. A connection Apple refuses answers `apple-music-authorization-lost`; slice H derives "needs reauthorization" from the latest run ending with that code instead of storing it |
| Apple's answers | 401 is `apple-music-developer-token-refused` (answered 502), 403 `apple-music-authorization-lost` (400: the owner connects again), 429 after retries `apple-music-rate-limited` (503), 5xx or no answer `apple-music-unavailable` (503), anything else `apple-music-unexpected` (502). Without the Apple credentials and `TOKEN_ENCRYPTION_KEY`, the routes answer `apple-music-not-configured` (503) and the screen says so |
| REMOTE adapter | 10-second timeout per request; up to 3 retries on 429 and 5xx, honoring `Retry-After` up to 30 seconds, otherwise waiting 1, 2 and 4 seconds |
| Routes | `GET /api/apple-music/configuration`; `GET /api/apple-music/developer-token`; `GET`, `PUT` and `DELETE /api/libraries/{id}/apple-music/connection`. Any member reads the connection; only the owner connects or disconnects; `PUT` is limited to 10 requests a minute |
| Screen | `/libraries/{id}/apple-music`, opened from the library's home. Apple's script loads only when the owner presses Connect, so no other screen runs third-party code |
| Binding | The MusicKit script is BND-0003 in [.architecture-bindings.json](../../.architecture-bindings.json). `npm run check:bindings` fails unless the built client loads exactly that address, the source named loads it, and the Content-Security-Policy `script-src` allows its origin. Apple publishes no integrity hash for the unversioned v3 address, so none is pinned |

## Slice H as built

| Topic | As built |
|---|---|
| Order of a run | Songs, albums, artists, then playlists, each paged at `limit=100`; then the guard; then catalog songs (300 ids a request) and catalog albums (100), only for ids the run's items name; then removals. Every page or batch is fetched outside any transaction and stored, with the run's counts, in its own |
| Paging | `limit` and `include` are set on every page, because `next` carries only `offset` ([Apple: fetching resources by page](https://developer.apple.com/documentation/applemusicapi/fetching-resources-by-page); [WWDC22: Meet Apple Music API and MusicKit](https://developer.apple.com/videos/play/wwdc2022/10148/) notes that `next` does not keep the page size). Only the offset is taken from `next`, so a `next` naming another host is never followed, and one that does not move forward fails the run instead of paging forever. A first page answered 404 is read as an empty list, a tolerance: Apple documents 404 for a missing single resource and says nothing of empty lists |
| Change detection | No stored hash: the upsert compares the catalog id, attributes and relationship ids with `IS DISTINCT FROM`, and `jsonb` compares values, not text. Items carry the runs that first saw, last saw, last changed and found them removed; a run's added, changed and removed counts are counted from those at its end, so an item listed twice is not counted twice |
| Guard | Evaluated after the four lists: when the mirror held items and the run saw none of them again, an empty listing included, the run deletes the items it added, leaving the mirror as it was, and ends `needs-confirmation`. The owner's "Replace the mirror" starts a run with `replaceMirror`, which skips the guard; editors cannot |
| Stopping | Cancelling (owners and editors) aborts the run between pages; a running run with no task in this process is marked `interrupted`. Closing the server aborts its tasks, which end `interrupted`; at start, before listening, the owner role marks runs left `running` as `interrupted`. A failure after a cancellation or shutdown was asked for ends the run as asked |
| Errors | An Apple failure ends the run `failed` with its code; a stored token that no longer opens (the key changed) with `apple-music-token-unreadable`; anything else with `unexpected`, logged |
| Routes | `GET /api/libraries/{id}/apple-music/sync-runs/latest` (members, polled every 2 seconds while a run runs); `POST .../sync-runs` with `replaceMirror` (owners and editors; `replaceMirror` the owner only; at most two starts a minute per library, so a replacement can follow a stopped run; a second running run is refused with `sync-already-running`); `POST .../sync-runs/{runId}/cancel` |
| Metrics | `apple_music_sync_runs_total{status}` counts finished runs since the process started |
| Not read | Playlist tracks, and the catalog artists and playlists that library artists and playlists name; their catalog ids are kept |
| Known limit | Offset paging can skip or repeat an item when the Apple Music library changes during a read; a skipped item is marked removed and the next read restores it |
| Fake | `tests/support/appleMusicFake.ts` with `appleMusicFakeLibrary.ts` (routes) and `appleMusicFixture.ts`: five songs (one uploaded, without a catalog id), four albums, three artists, one playlist, four catalog songs and three catalog albums, with invented names and codes. `next` carries only `offset`; relationships appear only when included; another storefront answers nothing; a test can swap the library, or hold the next request to test cancellation and shutdown |
| Slice G follow-up | Connecting now asks Apple for the storefront between two short transactions instead of inside one |

## Tables

| Table | Holds |
|---|---|
| `apple_music_connection` | One per library: the sealed Music User Token (key version, nonce, tag and ciphertext in one value), who connected it and when. Built in G; the storefront is on `library` |
| `sync_run` | Id, status (`running`, `succeeded`, `failed`, `interrupted`, `needs-confirmation`, `cancelled`), phase, whether it replaces the mirror, who started it, start and finish, counts read by kind, catalog items found, items added, changed and removed, error code; at most one `running` per library (`sync_run_one_running`). Built in H |
| `apple_library_item` | Kind (song, album, artist, playlist), Apple library id, catalog id, attributes and relationship ids as returned, and the runs that first saw, last saw, last changed and found it removed. Built in H, without the planned content hash |
| `apple_catalog_item` | Kind (song, album), storefront, catalog id, attributes and relationship ids as returned, the run that fetched it. Built in H |
| `apple_import_link` | Apple kind and library id, and the curated entry created from it (performer, album, edition, recording) |

All carry `library_id` and the row-level security policy every library table has.

## Mapping into the curated catalog

The planners are PURE and deterministic: the same mirror gives the same plan.

| Curated entry | Built from | Rules |
|---|---|---|
| Performer | Library artists; names in `artistName` that match no library artist | A whole name that matches a library artist is one performer, so `Simon & Garfunkel` stays a duo. Otherwise `feat.`, `featuring` and `ft.` split featured performers off, then `, ` and ` & ` split the rest. Kind from words in the name (orchestra, philharmonic, symphony, choir, chorus, quartet, ensemble), else `person` for a single name and `group` otherwise, for review |
| Credits | Song and album `artistName`; catalog `composerName` | `primary` credits in order with the join phrases Apple printed; featured performers as `featured`; composers as `composer`. A title's `(feat. X)` becomes a featured credit and leaves the title |
| Edition | Each library album | Edition markers in the title (`(Deluxe Edition)`, `[Remastered 2009]`, `(Super Deluxe)`, `(25th Anniversary Edition)`, `(Expanded)`) set the kind and are removed to find the album; UPC from the catalog album |
| Album | Editions grouped by base title and primary artist | Kind from the catalog flags and markers (`- EP`, `- Single`, live). Its intended track list is the core tracks of its `original` edition, or of the only edition when there is one |
| Recording | Library songs | Songs with the same ISRC are one recording; without an ISRC, the same base title, primary artist and duration within two seconds. Version markers (`(Live at …)`, `(Demo)`, `(Alternate Take)`, `(Mono)`) set the kind and version note; remaster markers do not make a different recording |
| Edition track | Each song on its album, by disc and track number | `core` when its recording is on the intended track list; otherwise from markers (`demo`, `live`, `interview`, `commentary`, `alternate`), else `bonus` |
| Genres | Apple `genreNames` | Matched through genre aliases, ignoring case; the umbrella name `Music` is ignored; unmatched names are counted and listed for mapping, and no genre is created |
| Identifiers | Library and catalog ids, ISRC, UPC | Written as external identifiers, normalized like any other |

Every rule is exercised by the fake's fixture library: an album with original and deluxe editions carrying demos, live tracks and an interview; a duo whose name contains `&`; a featured artist in a title; a concerto album drawing on performances with two orchestras; a compilation, a live album and a single; an uploaded song with no catalog match; the same recording on two editions; and the genre name `Music`.

## Fake Apple Music API

A Fastify server in `tests/support/appleMusicFake.ts`, started on a free port by integration and end-to-end tests, with `APPLE_MUSIC_API_BASE_URL` pointed at it. Slice G built the token checks, the storefront and chosen failures; slice H the library lists, catalog lookups and fixture library ([Slice H as built](#slice-h-as-built)). It verifies the developer token with the test key's public half (ES256, `kid`, `iss`, `exp` no more than six months ahead) and the Music User Token against its fixture; serves the storefront, the four library lists with `include`, `limit` (400 above 100), `offset` and `next`, and catalog songs and albums by id (400 above 300 song ids or 100 album ids); and can be told to answer 429 with `Retry-After`, 500, or 403 on chosen requests. End-to-end tests replace Apple's MusicKit script with a stub through Playwright's request routing, so `authorize()` resolves with the fixture's token.

## Security

The Music User Token travels from the browser to the server once and is never returned. It is never logged: the server logs request lines and unexpected errors, not request bodies or headers. The browser developer token is served only to a signed-in member and carries the `origin` claim for this application's public origin. Connecting and disconnecting are owner actions, and connecting is limited to 10 requests a minute; starting a sync needs editor or owner, and is limited to two starts a minute per library; replacing the mirror needs the owner.

## Owner live check

Needs Apple Developer Program membership, a MusicKit key and its id, the Team ID, and a 32-byte `TOKEN_ENCRYPTION_KEY` (Q-2). With them set, the owner connects a library, runs the first import, and reports the counts and anything misclassified, which become fixture cases.
