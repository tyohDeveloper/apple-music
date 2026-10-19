# Apple Music integration

Decision record: [ADR-0005](https://github.com/tyohDeveloper/apple-music/blob/main/docs/adr/0005-apple-music-integration-boundary.md).

## What you need

- An Apple Developer Program membership, with a MusicKit identifier and private key. Apple requires a developer token signed with that key on every Apple Music API request ([Apple: generating developer tokens](https://developer.apple.com/documentation/applemusicapi/generating-developer-tokens)).
- An Apple Music subscription on the Apple ID whose library you attach.

Without the developer credentials the application still runs; Apple Music features report that they are not configured.

## Connecting a library

1. Create a library and name it for the Apple ID it will hold.
2. Choose **Connect Apple Music**. Apple's MusicKit on the Web opens Apple's own sign-in and authorization window ([MusicKit on the Web: user authorization](https://js-cdn.music.apple.com/musickit/v3/docs/index.html?path=/story/user-authorization--page)).
3. The resulting Music User Token is sent to the server once and stored encrypted. It never returns to the browser.

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

Apple Music User Tokens expire and can be revoked. When Apple rejects the token, the library is marked as needing reauthorization; connect again to continue. If a reconnection reaches a library that shares nothing with the stored one, the next import stops and asks for confirmation instead of treating everything as removed.
