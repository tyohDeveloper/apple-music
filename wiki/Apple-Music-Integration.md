# Apple Music integration

Decision record: [ADR-0005](https://github.com/tyohDeveloper/apple-music/blob/main/docs/adr/0005-apple-music-integration-boundary.md).

**Status:** connecting a library and reading it into a mirror work ([Reading from Apple Music](Reading-from-Apple-Music.md)). Importing the mirror into the catalog is being built; changes in Apple Music come in a later phase ([Roadmap](Roadmap.md)).

## What you need

- An Apple Developer Program membership, with a MusicKit identifier and private key. Apple requires a developer token signed with that key on every Apple Music API request ([Apple: generating developer tokens](https://developer.apple.com/documentation/applemusicapi/generating-developer-tokens)).
- An Apple Music subscription on the Apple ID whose library you attach.

Without the developer credentials the application still runs; Apple Music features report that they are not configured.

## Connecting a library

Each library holds one Apple ID's library, so name it for that Apple ID. Its owner connects it from the library's **Apple Music** screen through Apple's own sign-in window; the resulting Music User Token is sent to the server once and stored encrypted, and never returns to the browser. [Connecting Apple Music](Connecting-Apple-Music.md) walks through the steps and explains each message.

## What is read

Library songs, albums, artists and playlists, page by page, plus the matching catalog entries for ISRCs, composers, work and movement names, labels and track counts. What Apple returns is kept as a mirror; your curated records are built from it and are never overwritten by it.

## What can be changed in Apple Music

| Change | Typical use |
|---|---|
| Create a playlist folder | A folder for intended albums |
| Create a playlist and add tracks | The intended album as a playlist, in order |
| Add catalog items to the library | Add the original edition when only a deluxe edition is in the library |
| Ratings | Love or dislike songs, albums and playlists |
| Favorites | Mark items as favorites |

Each change is proposed first, shown with exactly what will be sent, and applied only after you approve it. Results and failures are recorded.

## What cannot be changed

Apple's API documents no way to rename or re-tag existing library items, delete them, or remove tracks from playlists. Those stay manual steps in Apple's Music app; the application can list what to remove.

## If the token stops working

Apple Music User Tokens expire and can be revoked. When Apple rejects the token, connect the library again. Once imports are built, an import that Apple refuses stops, and the Apple Music screen asks for the library to be connected again. If a reconnection reaches a library that shares nothing with the stored one, the next import stops and asks for confirmation instead of treating everything as removed.
