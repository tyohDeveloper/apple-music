// Why a call to the Apple Music API failed, as the rest of the application acts on it: 401
// means Apple refused the developer token, 403 the Music User Token (the library must be
// reconnected), 429 that requests kept being limited, and 5xx or no answer that Apple was
// unavailable.
export type AppleMusicFailureCode =
  | "apple-music-developer-token-refused"
  | "apple-music-authorization-lost"
  | "apple-music-rate-limited"
  | "apple-music-unavailable"
  | "apple-music-unexpected";

export class AppleMusicFailure extends Error {
  readonly code: AppleMusicFailureCode;
  readonly status: number | null;

  constructor(code: AppleMusicFailureCode, status: number | null) {
    super(status === null ? code : `${code} (HTTP ${status})`);
    this.name = "AppleMusicFailure";
    this.code = code;
    this.status = status;
  }
}
