// A duration typed as m:ss or h:mm:ss, with optional milliseconds (3:25, 1:02:03, 3:25.347),
// in milliseconds. Blank is null (no duration); anything else that does not parse is
// undefined, which a form reports as invalid rather than sending.
const durationPattern = /^(?:(\d+):([0-5]\d)|(\d+)):([0-5]\d)(?:\.(\d{1,3}))?$/u;
const maximumMs = 2147483647;

export function durationMsOf(text: string): number | null | undefined {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  const match = durationPattern.exec(trimmed);
  if (match === null) return undefined;
  const [, hours = "0", minutesAfterHours, minutesAlone, seconds = "0", fraction = ""] = match;
  const minutes = Number(minutesAfterHours ?? minutesAlone ?? "0");
  const ms = ((Number(hours) * 60 + minutes) * 60 + Number(seconds)) * 1000 + Number(fraction.padEnd(3, "0"));
  return ms <= maximumMs ? ms : undefined;
}
