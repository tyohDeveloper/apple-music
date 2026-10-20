// Calls the Apple Music API (docs/design/apple-music-import.md): the developer token on every
// request and the Music User Token on library requests, a timeout per attempt, and up to three
// retries, waiting Retry-After (at most 30 seconds) after 429 and 1, 2 then 4 seconds after a
// 5xx answer or no answer. Other failures are not retried.
import { AppleMusicFailure } from "./appleMusicFailure.ts";

type AppleMusicRequest = { readonly path: string; readonly musicUserToken: string | null };
export type AppleMusicClient = { readonly get: (request: AppleMusicRequest) => Promise<unknown> };
export type AppleMusicClientSettings = {
  readonly baseUrl: string;
  readonly developerToken: () => Promise<string>;
  readonly timeoutMs?: number;
  readonly sleep?: (ms: number) => Promise<void>;
};

const maxRetries = 3;
const unanswered = "unanswered";
type Outcome = Response | typeof unanswered;

async function outcomeOf(settings: AppleMusicClientSettings, request: AppleMusicRequest): Promise<Outcome> {
  const headers: Record<string, string> = { authorization: `Bearer ${await settings.developerToken()}` };
  if (request.musicUserToken !== null) headers["music-user-token"] = request.musicUserToken;
  try {
    return await fetch(new URL(request.path, settings.baseUrl), { headers, signal: AbortSignal.timeout(settings.timeoutMs ?? 10_000) });
  } catch {
    return unanswered;
  }
}

// How long to wait before trying again, or null when the outcome is final.
function retryWaitOf(outcome: Outcome, attempt: number): number | null {
  if (attempt >= maxRetries) return null;
  if (outcome === unanswered || outcome.status >= 500) return 1000 * 2 ** attempt;
  if (outcome.status !== 429) return null;
  const seconds = Number(outcome.headers.get("retry-after"));
  return Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds, 30) * 1000 : 5000;
}

const failureByStatus: Readonly<Record<number, AppleMusicFailure["code"]>> = {
  401: "apple-music-developer-token-refused",
  403: "apple-music-authorization-lost",
  429: "apple-music-rate-limited",
};

async function bodyOf(outcome: Outcome): Promise<unknown> {
  if (outcome === unanswered) throw new AppleMusicFailure("apple-music-unavailable", null);
  if (outcome.ok) return outcome.json();
  const code = failureByStatus[outcome.status] ?? (outcome.status >= 500 ? "apple-music-unavailable" : "apple-music-unexpected");
  throw new AppleMusicFailure(code, outcome.status);
}

const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function appleMusicClientOf(settings: AppleMusicClientSettings): AppleMusicClient {
  const sleep = settings.sleep ?? pause;
  const get = async (request: AppleMusicRequest): Promise<unknown> => {
    for (let attempt = 0; ; attempt += 1) {
      const outcome = await outcomeOf(settings, request);
      const wait = retryWaitOf(outcome, attempt);
      if (wait === null) return bodyOf(outcome);
      if (outcome !== unanswered) await outcome.body?.cancel();
      await sleep(wait);
    }
  };
  return { get };
}
