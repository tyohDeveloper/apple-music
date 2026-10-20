// A stored track list, ordered by disc and position, split into its discs. Disc indexes are
// 0-indexed and contiguous, as the replace-tracks requests store them.
export function discsOf<T extends { readonly discIndex: number }>(tracks: readonly T[]): T[][] {
  const discs: T[][] = [];
  for (const track of tracks) (discs[track.discIndex] ??= []).push(track);
  return discs.filter((disc) => disc.length > 0);
}
