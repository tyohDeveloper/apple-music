# Connecting Apple Music

Connecting a library lets the application read the Apple Music library of one Apple ID. It is the first step of importing; reading and importing the library are being built ([Roadmap](Roadmap.md)). What the integration reads and can change is described in [Apple Music integration](Apple-Music-Integration.md).

## Before you start

- The server needs Apple Developer credentials (Team ID, MusicKit key id and private key) and a token encryption key; see [Getting started](Getting-Started.md#environment). Without them, the Apple Music screen says that Apple Music is not set up on this server.
- Only the library's owner connects or disconnects it. Other members see whether it is connected.

## Connecting

1. Open the library, then **Apple Music**.
2. Choose **Connect Apple Music**. Apple's MusicKit on the Web opens Apple's own window ([MusicKit on the Web: user authorization](https://js-cdn.music.apple.com/musickit/v3/docs/index.html?path=/story/user-authorization--page)). Sign in with the Apple ID whose library this is and allow access. Your Apple ID password goes only to Apple.
3. The server checks the authorization with Apple, which also reports the Apple ID's storefront, the country of its store ([Apple: get a user's storefront](https://developer.apple.com/documentation/applemusicapi/get-a-user's-storefront.md)). It then stores the authorization encrypted, and the screen shows when the library was connected and its storefront.

Connecting a library that is already connected replaces the stored authorization, which is how a connection that stopped working is renewed.

## Disconnecting

**Disconnect** deletes the stored authorization. Nothing changes in Apple Music, and nothing is removed from the library's catalog. The storefront stays recorded on the library, because Apple's catalog identifiers belong to a storefront.

## Messages

| Message | Meaning | What to do |
|---|---|---|
| Apple Music is not set up on this server yet | The server lacks the Apple Developer credentials or the token encryption key | Set them; see [Getting started](Getting-Started.md#environment) |
| Apple Music access was not allowed, so nothing changed | Apple's window was closed, or access was declined | Connect again and allow access |
| Apple's MusicKit could not be loaded | The browser could not load Apple's script: no connection, or a blocker | Check the connection and try again |
| Apple did not accept the authorization | Apple refused the Music User Token | Connect again |
| Apple refused this server's credentials | Apple refused the server's developer token: a wrong Team ID, key id or key, or a revoked key | The server's administrator checks the Apple Developer settings |
| Apple Music is limiting requests | Apple kept answering "too many requests" | Wait a few minutes |
| Apple Music did not answer | Apple was unavailable or too slow | Try again later |
| Too many requests | More than 10 connection attempts in a minute | Wait a minute |

## What is stored

| Item | Where | Who sees it |
|---|---|---|
| The Music User Token, encrypted with AES-256-GCM under the server's key and bound to this library | The database | Nobody; only the server uses it, to call Apple |
| Who connected the library, and when | The database | Library members |
| The storefront | The library | Library members |

The token travels from the browser to the server once, is never sent back, and is never logged. Apple's script runs only on the Apple Music screen, and only after you choose **Connect Apple Music** ([Apple: user authentication for MusicKit](https://developer.apple.com/documentation/applemusicapi/user-authentication-for-musickit)).
