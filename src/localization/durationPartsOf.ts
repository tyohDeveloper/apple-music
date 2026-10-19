// The hours, minutes and seconds of a duration shown to a reader, rounded to the nearest
// second; localized digits are applied by the caller.
export type DurationParts = { readonly hours: number; readonly minutes: number; readonly seconds: number };

export function durationPartsOf(ms: number): DurationParts {
  const totalSeconds = Math.round(ms / 1000);
  return { hours: Math.floor(totalSeconds / 3600), minutes: Math.floor(totalSeconds / 60) % 60, seconds: totalSeconds % 60 };
}
