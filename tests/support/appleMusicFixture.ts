// The fake Apple Music library (docs/design/apple-music-import.md, "Fake Apple Music API"):
// library songs, albums, artists and playlists, and the catalog songs and albums they point
// to, with attributes named as Apple documents them. Names, ids and codes are invented.
// Relationships name ids only; the fake renders them as Apple's relationship objects when a
// request includes them.
export type FakeItem = {
  readonly id: string;
  readonly attributes: Readonly<Record<string, unknown>>;
  readonly relationships: Readonly<Record<string, readonly string[]>>;
};

export type FakeLibrary = {
  readonly songs: readonly FakeItem[];
  readonly albums: readonly FakeItem[];
  readonly artists: readonly FakeItem[];
  readonly playlists: readonly FakeItem[];
  readonly catalogSongs: readonly FakeItem[];
  readonly catalogAlbums: readonly FakeItem[];
};

const artwork = { width: 3000, height: 3000, url: "https://is1-ssl.mzstatic.com/image/thumb/fake/{w}x{h}bb.jpg" };

type SongFields = { readonly id: string; readonly name: string; readonly album: string; readonly albumName: string; readonly artists: readonly string[]; readonly artistName: string; readonly track: number; readonly catalog: string | null };

function librarySong(song: SongFields): FakeItem {
  const playParams = { id: song.id, kind: "song", isLibrary: true, reporting: true, ...(song.catalog === null ? {} : { catalogId: song.catalog }) };
  return {
    id: song.id,
    attributes: { name: song.name, albumName: song.albumName, artistName: song.artistName, artwork, discNumber: 1, trackNumber: song.track, durationInMillis: 200_000 + song.track * 1000, genreNames: ["Alternative"], hasLyrics: false, releaseDate: "2019-05-03", playParams },
    relationships: { albums: [song.album], artists: song.artists, catalog: song.catalog === null ? [] : [song.catalog] },
  };
}

function libraryAlbum(id: string, name: string, artistName: string, trackCount: number, catalog: string | null): FakeItem {
  const playParams = { id, kind: "album", isLibrary: true };
  return { id, attributes: { name, artistName, artwork, trackCount, genreNames: ["Alternative"], releaseDate: "2019-05-03", dateAdded: "2024-01-15T10:00:00Z", playParams }, relationships: { catalog: catalog === null ? [] : [catalog] } };
}

function catalogSong(id: string, name: string, albumName: string, artistName: string, isrc: string, album: string): FakeItem {
  return {
    id,
    attributes: { name, albumName, artistName, artwork, isrc, composerName: "Ada Lantern", discNumber: 1, trackNumber: 1, durationInMillis: 201_000, genreNames: ["Alternative", "Music"], releaseDate: "2019-05-03", url: `https://music.apple.com/us/song/${id}`, playParams: { id, kind: "song" } },
    relationships: { albums: [album] },
  };
}

function catalogAlbum(id: string, name: string, artistName: string, upc: string, trackCount: number): FakeItem {
  return {
    id,
    attributes: { name, artistName, artwork, upc, trackCount, recordLabel: "Harbor Records", copyright: "℗ 2019 Harbor Records", isCompilation: false, isSingle: false, isComplete: true, genreNames: ["Alternative", "Music"], releaseDate: "2019-05-03", url: `https://music.apple.com/us/album/${id}`, playParams: { id, kind: "album" } },
    relationships: {},
  };
}

export const fixtureLibrary: FakeLibrary = {
  songs: [
    librarySong({ id: "i.fakeSong01", name: "Harbor Lights", album: "l.fakeAlbum01", albumName: "Harbor Lights", artists: ["r.fakeArtist01"], artistName: "The Lanterns", track: 1, catalog: "9100000001" }),
    librarySong({ id: "i.fakeSong02", name: "Low Tide", album: "l.fakeAlbum01", albumName: "Harbor Lights", artists: ["r.fakeArtist01"], artistName: "The Lanterns", track: 2, catalog: "9100000002" }),
    librarySong({ id: "i.fakeSong03", name: "Low Tide (Demo)", album: "l.fakeAlbum02", albumName: "Harbor Lights (Deluxe Edition)", artists: ["r.fakeArtist01"], artistName: "The Lanterns", track: 3, catalog: "9100000003" }),
    librarySong({ id: "i.fakeSong04", name: "Violin Concerto: I. Allegro", album: "l.fakeAlbum03", albumName: "Concertos", artists: ["r.fakeArtist02", "r.fakeArtist03"], artistName: "Mira Sol & Northern Lights Orchestra", track: 1, catalog: "9100000004" }),
    librarySong({ id: "i.fakeSong05", name: "Basement Tape", album: "l.fakeAlbum04", albumName: "Basement Tapes", artists: ["r.fakeArtist01"], artistName: "The Lanterns", track: 1, catalog: null }),
  ],
  albums: [
    libraryAlbum("l.fakeAlbum01", "Harbor Lights", "The Lanterns", 2, "9200000001"),
    libraryAlbum("l.fakeAlbum02", "Harbor Lights (Deluxe Edition)", "The Lanterns", 3, "9200000002"),
    libraryAlbum("l.fakeAlbum03", "Concertos", "Mira Sol & Northern Lights Orchestra", 1, "9200000003"),
    libraryAlbum("l.fakeAlbum04", "Basement Tapes", "The Lanterns", 1, null),
  ],
  artists: [
    { id: "r.fakeArtist01", attributes: { name: "The Lanterns" }, relationships: { catalog: ["9300000001"] } },
    { id: "r.fakeArtist02", attributes: { name: "Mira Sol" }, relationships: { catalog: ["9300000002"] } },
    { id: "r.fakeArtist03", attributes: { name: "Northern Lights Orchestra" }, relationships: { catalog: [] } },
  ],
  playlists: [
    { id: "p.fakePlaylist01", attributes: { name: "Road Trip", canEdit: true, isPublic: false, hasCatalog: false, dateAdded: "2024-02-01T09:00:00Z", playParams: { id: "p.fakePlaylist01", kind: "playlist", isLibrary: true } }, relationships: { catalog: [] } },
  ],
  catalogSongs: [
    catalogSong("9100000001", "Harbor Lights", "Harbor Lights", "The Lanterns", "QZFAK1900001", "9200000001"),
    catalogSong("9100000002", "Low Tide", "Harbor Lights", "The Lanterns", "QZFAK1900002", "9200000001"),
    catalogSong("9100000003", "Low Tide (Demo)", "Harbor Lights (Deluxe Edition)", "The Lanterns", "QZFAK1900003", "9200000002"),
    catalogSong("9100000004", "Violin Concerto: I. Allegro", "Concertos", "Mira Sol & Northern Lights Orchestra", "QZFAK1900004", "9200000003"),
  ],
  catalogAlbums: [
    catalogAlbum("9200000001", "Harbor Lights", "The Lanterns", "000000000017", 2),
    catalogAlbum("9200000002", "Harbor Lights (Deluxe Edition)", "The Lanterns", "000000000024", 3),
    catalogAlbum("9200000003", "Concertos", "Mira Sol & Northern Lights Orchestra", "000000000031", 1),
  ],
};
