# Reading from Apple Music

Reading copies a connected library's songs, albums, artists and playlists from Apple Music, with the catalog details Apple has for them, into a mirror kept by this application. Nothing changes in Apple Music. Importing from the mirror into the catalog (performers, recordings, albums and genres) is the next step and is not available yet ([Roadmap](Roadmap.md)).

## Before you start

- Connect the library first ([Connecting Apple Music](Connecting-Apple-Music.md)). The reading panel appears on the library's **Apple Music** screen once it is connected.
- Owners and editors read; viewers see the latest read and its counts.

## Reading

1. Open the library, then **Apple Music**.
2. Choose **Read from Apple Music**. The panel shows what the read is doing (reading songs, albums, artists or playlists, looking up catalog songs and albums, recording what Apple Music no longer lists) and updates every two seconds.
3. When it ends, the panel shows when it finished and its counts.

A large library takes a while: Apple answers 100 library items, 300 catalog songs or 100 catalog albums per request ([Apple: fetching resources by page](https://developer.apple.com/documentation/applemusicapi/fetching-resources-by-page)). One read runs at a time per library, and a library can start at most two a minute. **Cancel the read** stops it between pages; what it had read stays in the mirror, and the next read completes it.

## Counts

| Count | Meaning |
|---|---|
| Songs, albums, artists, playlists | Items Apple Music listed in this read |
| Catalog songs, catalog albums | Catalog entries Apple returned for the songs and albums read; uploaded songs and items Apple has not matched have none |
| New in the mirror | Items this read added |
| Changed | Items whose details Apple now reports differently, or that Apple lists again after a read had found them gone |
| No longer listed | Items an earlier read saw that Apple Music no longer lists. They stay in the mirror, marked, and nothing in the catalog is removed |

## When a read stops for confirmation

If Apple Music lists none of the items the mirror holds, the read stops, leaves the mirror as it was, and says so. This usually means the library was connected with another Apple ID; it can also be a fault on Apple's side. Then:

- If the wrong Apple ID was connected, connect the right one ([Connecting Apple Music](Connecting-Apple-Music.md)) and read again.
- If this is the right library, the owner chooses **Replace the mirror**: the read runs without the check, marks everything the mirror held as no longer listed, and records this library's items. Nothing in the catalog changes.

## Messages

| Message | Meaning | What to do |
|---|---|---|
| The last read stopped with an error: Apple did not accept the authorization | Apple refused the stored Music User Token, which expires or can be revoked | Connect again, then read |
| The last read stopped with an error: the stored Apple Music authorization can no longer be read | The server's token encryption key changed since the library was connected | Connect again, then read |
| The last read stopped with an error: Apple Music is limiting requests, or did not answer | Apple kept refusing or did not answer after retries | Read again later |
| The last read was interrupted because the server stopped | The server restarted during the read | Read again |
| A read from Apple Music is already running for this library | Another member started one | Wait for it to finish |
| This library is not connected to Apple Music | The connection was removed | Connect, then read |
