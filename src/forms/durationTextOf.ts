// A duration in milliseconds as the editor shows it for change: m:ss or h:mm:ss, with
// milliseconds only when the duration has them, so durationMsOf reads it back unchanged.
const pad = (value: number): string => String(value).padStart(2, "0");

export function durationTextOf(ms: number | null): string {
  if (ms === null) return "";
  const totalSeconds = Math.floor(ms / 1000);
  const fraction = ms % 1000 === 0 ? "" : `.${String(ms % 1000).padStart(3, "0")}`;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const clock = hours > 0 ? `${String(hours)}:${pad(minutes)}:${pad(totalSeconds % 60)}` : `${String(minutes)}:${pad(totalSeconds % 60)}`;
  return clock + fraction;
}
