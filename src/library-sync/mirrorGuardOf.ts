// Whether a run may record removals (docs/ARCHITECTURE.md, Import pipeline). When the mirror
// holds items and Apple's listing shares none of them, an empty listing included, the
// listing is more likely another Apple account or an Apple fault than a library emptied and
// refilled, so the run stops for confirmation unless the owner asked to replace the mirror.
export type MirrorGuardCounts = { readonly storedBefore: number; readonly reseen: number; readonly replaceMirror: boolean };

export function mirrorGuardOf(counts: MirrorGuardCounts): "proceed" | "needs-confirmation" {
  if (counts.replaceMirror || counts.storedBefore === 0 || counts.reseen > 0) return "proceed";
  return "needs-confirmation";
}
