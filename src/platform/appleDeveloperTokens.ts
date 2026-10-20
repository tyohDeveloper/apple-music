// Apple Music developer tokens (docs/design/apple-music-import.md): ES256 JWTs signed with
// the MusicKit private key, its key id in the header and the Team ID as issuer, valid for 12
// hours (Apple allows six months). One token per audience is cached and replaced an hour
// before it expires; the browser's carries the origin claim for this application's origin.
import { importPKCS8, SignJWT } from "jose";

export type AppleCredentials = { readonly teamId: string; readonly keyId: string; readonly privateKey: string };
export type DeveloperToken = { readonly token: string; readonly expiresAt: Date };
export type DeveloperTokens = {
  readonly forServer: () => Promise<DeveloperToken>;
  readonly forBrowser: (origin: string) => Promise<DeveloperToken>;
};

type SigningKey = Awaited<ReturnType<typeof importPKCS8>>;

const lifetimeSeconds = 12 * 60 * 60;
const renewBeforeMs = 60 * 60 * 1000;

async function signedToken(key: SigningKey, credentials: AppleCredentials, nowMs: number, origin: string | null): Promise<DeveloperToken> {
  const issuedAt = Math.floor(nowMs / 1000);
  const claims = origin === null ? {} : { origin: [origin] };
  const token = await new SignJWT(claims)
    .setProtectedHeader({ alg: "ES256", kid: credentials.keyId })
    .setIssuer(credentials.teamId)
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + lifetimeSeconds)
    .sign(key);
  return { token, expiresAt: new Date((issuedAt + lifetimeSeconds) * 1000) };
}

// Fails at start when the private key is not a PKCS #8 P-256 key, rather than on first use.
export async function developerTokensOf(credentials: AppleCredentials, now: () => number = Date.now): Promise<DeveloperTokens> {
  const key = await importPKCS8(credentials.privateKey, "ES256");
  const cache = new Map<string, DeveloperToken>();
  const tokenFor = async (origin: string | null): Promise<DeveloperToken> => {
    const cached = cache.get(origin ?? "");
    if (cached !== undefined && cached.expiresAt.getTime() - now() > renewBeforeMs) return cached;
    const fresh = await signedToken(key, credentials, now(), origin);
    cache.set(origin ?? "", fresh);
    return fresh;
  };
  return { forServer: () => tokenFor(null), forBrowser: (origin) => tokenFor(origin) };
}
