# Apple Music Library Manager

A web application for maintaining an Apple Music library as a curated catalog. It keeps its own records of albums, recordings and performers, imports what Apple Music knows, and changes Apple Music only in the ways Apple's API allows.

**Status:** the foundation is done; the curated catalog is being built. Performers, recordings, albums and genres, with credits, intended track lists, editions, genre trees and identifiers from Apple Music, ISRC, UPC, MusicBrainz, Discogs and Wikidata, can be edited now; exporting a library comes next. See the [Roadmap](Roadmap.md).

## Why it exists

Apple Music treats a library as a list of songs with text fields. That makes some common cleanup impossible to express:

- An album is offered as a "deluxe edition" full of demos, live takes and interviews that were never part of the record its artist made.
- One album appears as several, because different tracks list different artists.
- A soloist's album drawn from concerts with different orchestras has no way to say which orchestra played which track.
- "John R. Cash" and "Johnny Cash" are two artists; a band member, a duet partner and a featured singer are all just text.

This application models those things directly. See [Concepts](Concepts.md).

## Pages

| Page | Contents |
|---|---|
| [Concepts](Concepts.md) | Albums, editions, recordings and tracks; performers, names, relations and credits |
| [Editing performers](Editing-Performers.md) | Finding, naming, relating and deleting performers |
| [Editing recordings](Editing-Recordings.md) | Recordings, their credits and the credit line |
| [Editing albums](Editing-Albums.md) | Albums, their intended track lists, and editions with classified tracks |
| [Editing genres](Editing-Genres.md) | The genre tree, aliases, and the genres of albums, recordings and performers |
| [Editing identifiers](Editing-Identifiers.md) | Apple Music, ISRC, UPC, MusicBrainz, Discogs and Wikidata identifiers, and which entries take which |
| [Cleanup workflows](Cleanup-Workflows.md) | How the common cleanups are done |
| [Apple Music integration](Apple-Music-Integration.md) | What is read, what can be changed, what cannot, and how tokens are protected |
| [Getting started](Getting-Started.md) | Requirements and setup |
| [Development](Development.md) | Repository layout, standards and checks |
| [Roadmap](Roadmap.md) | Phases and open questions |
| [Glossary](Glossary.md) | Terms used throughout |

## Source of truth

These pages are written in the repository's [`wiki/`](https://github.com/tyohDeveloper/apple-music/blob/main/wiki) folder and published here automatically; edits made directly on this wiki are overwritten. Specifications live in [`docs/`](https://github.com/tyohDeveloper/apple-music/blob/main/docs).

## License

MIT.
