// The request path for one page of a library list. `limit` and `include` are set on every
// page because Apple's `next` subpath carries only `offset` and does not keep the page size
// (docs/design/apple-music-import.md, slice H). Songs include their albums, artists and
// catalog song; albums their artists and catalog album; artists and playlists their catalog
// counterpart.
export type LibraryKind = "song" | "album" | "artist" | "playlist";

const includesByKind: Readonly<Record<LibraryKind, string>> = {
  song: "albums,artists,catalog",
  album: "artists,catalog",
  artist: "catalog",
  playlist: "catalog",
};

export function libraryPathOf(kind: LibraryKind, offset: number, pageSize: number): string {
  return `/v1/me/library/${kind}s?limit=${pageSize}&include=${includesByKind[kind]}&offset=${offset}`;
}
