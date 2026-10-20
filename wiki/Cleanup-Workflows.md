# Cleanup workflows

Each workflow changes this application's records first. Changes to Apple Music are proposed separately and applied only when you approve them (see [Apple Music integration](Apple-Music-Integration.md)). The phase in which each workflow arrives is on the [Roadmap](Roadmap.md).

## Separate an album from its extras

1. Open the album. Its Apple Music edition lists every track with a suggested inclusion — `core`, `demo`, `live`, `interview` and so on — and the title marker that produced the suggestion.
2. Correct any suggestion. Your choice is kept on later imports.
3. The intended track list shows only the `core` tracks in their original order.
4. Optionally propose an Apple Music playlist holding exactly the intended album.

## Rejoin an album Apple split by artist

When tracks of one album list different artists, Apple Music can show several albums. They become editions of one album automatically when they share an Apple catalog album; otherwise merge them yourself. Track credits are untouched.

## Merge two performers who are one

1. Open the performer to keep and choose the one to merge in.
2. Its names become additional names of the kept performer; its credits, relations, genres and identifiers move across.
3. Credits keep the name that was printed.

## Record a name change

Add the new name with its start date, mark it preferred, and give the old one an end date and the kind `former`.

## Record who plays in what

Add `member of` relations from people to the group, with years and instruments. For a duet, give the recording two `primary` credits. For a concerto, credit the soloist, the orchestra and the conductor on each recording.

## Map genres

Create your genres, nest them, and map each Apple genre name onto one of yours.

## Export a library

Download the whole library as one JSON document for backup or inspection; see [Exporting a library](Exporting-a-Library.md).
