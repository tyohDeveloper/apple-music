// The genre list of an album, recording or performer after one change, as the ids a
// replace request sends. Adding a genre already on the list leaves the list as it is.
export type GenreListChange =
  | { readonly kind: "added"; readonly genreId: string }
  | { readonly kind: "moved"; readonly index: number; readonly offset: -1 | 1 }
  | { readonly kind: "removed"; readonly index: number };

function moved(ids: readonly string[], index: number, offset: -1 | 1): string[] {
  const target = index + offset;
  const [id, other] = [ids[index], ids[target]];
  if (id === undefined || other === undefined) return [...ids];
  return ids.map((each, position) => (position === index ? other : position === target ? id : each));
}

export function genreIdsAfter(ids: readonly string[], change: GenreListChange): string[] {
  switch (change.kind) {
    case "added":
      return ids.includes(change.genreId) ? [...ids] : [...ids, change.genreId];
    case "moved":
      return moved(ids, change.index, change.offset);
    case "removed":
      return ids.filter((_, position) => position !== change.index);
  }
}
