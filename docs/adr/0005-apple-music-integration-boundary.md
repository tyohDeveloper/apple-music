# ADR-0005: Apple Music integration boundary

## Status and date

Accepted, 2026-10-19. Owner: @tyohDeveloper.

## Context

The application reads a user's Apple Music library and changes some of it. Facts from Apple's documentation, read 2026-10-19:

- Every Apple Music API request needs a developer token: a JWT signed with ES256 using a MusicKit private key, with the key id in the header and the Team ID as issuer ([Generating developer tokens](https://developer.apple.com/documentation/applemusicapi/generating-developer-tokens)).
- Requests for library data also need a Music User Token, obtained when the user authorizes the application ([User authentication for MusicKit](https://developer.apple.com/documentation/applemusicapi/user-authentication-for-musickit)). On the web, MusicKit on the Web's `authorize()` opens Apple's sign-in flow and resolves with that token ([MusicKit on the Web: user authorization](https://js-cdn.music.apple.com/musickit/v3/docs/index.html?path=/story/user-authorization--page)).
- Library songs, albums, artists and playlists are read page by page with `limit`, `offset` and `next` ([Fetching resources by page](https://developer.apple.com/documentation/applemusicapi/fetching-resources-by-page)).
- Library writes the API documents: add catalog resources to the library, create library playlists and playlist folders, add tracks to a library playlist, add and delete ratings, add favorites ([Apple Music API](https://developer.apple.com/documentation/applemusicapi)).
- The API documents no endpoint to rename, re-tag or delete existing library items, or to remove tracks from playlists.

## Decision

1. Apple Music is a REMOTE datastore (`datastore-ownership.json`); all API access is in `src/apple-music/**` behind a typed port, with a configurable base URL so tests run against a contract-faithful fake.
2. MusicKit on the Web is used only on the connection screen, only to obtain the Music User Token; it is loaded from Apple's CDN when that screen opens.
3. The server signs and caches two developer tokens: one carrying an `origin` claim for this application's origin, which Apple recommends for web clients and which the browser receives only to configure MusicKit; and one without that claim, used only for the server's own requests, which carry no browser origin. Both expire well within Apple's six-month maximum.
4. The Music User Token is sent to the server once and stored encrypted with AES-256-GCM under a key from the environment, with the key version recorded. A 401 or 403 from Apple marks the connection `needs-reauthorization`.
5. Reads go into the Apple mirror (`apple_library_item`, `apple_catalog_item`); the curated catalog is built from the mirror and never overwritten by it.
6. Writes are planned as `apple_change` rows (kind, request body, subject), shown to a library member, and executed only after approval. Results and failures are recorded; failures are not retried automatically.
7. The main Apple-side projection of cleanup is a playlist per intended album, holding exactly its core tracks in order, inside a dedicated playlist folder.
8. Requests use timeouts, honour `Retry-After` on 429, and back off on 5xx.
9. No playback.

## Alternatives rejected and why

| Alternative | Why rejected |
|---|---|
| Call the API from the browser through MusicKit's passthrough method | Puts sync logic and the import pipeline in the browser, needs the tab open for long imports, and leaves no server-side record of what was read or changed. |
| Unofficial web-player endpoints that can delete or reorder | Undocumented, authenticated with a browser cookie, and can break or be withdrawn without notice. |
| Write changes immediately when a curated field is edited | Apple cannot represent most curated fields, and writes to a user's library should be deliberate and auditable. |

## Consequences

- Apple features need Apple Developer Program credentials (Team ID, MusicKit key id, private key); without them the application runs and reports Apple Music as not configured.
- Cleanup inside Apple Music is additive (playlists, ratings, favorites); removing extras from Apple's own albums stays a manual step in Apple's Music app, which the application can list.
- The port leaves room for other streaming services as separate REMOTE adapters (R-24).

## Evidence and approval

Apple documentation cited above; owner request of 2026-10-19.

## Supersession

None.
