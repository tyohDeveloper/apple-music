// Seals and opens Music User Tokens with AES-256-GCM (docs/design/apple-music-import.md): a
// fresh 12-byte nonce per seal, the library id as additional data so that a sealed token
// cannot be moved to another library's row, and the key version in front so that keys can
// rotate. Sealed form: v<version>.<nonce>.<tag>.<ciphertext>, the last three base64url.
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export type TokenKey = { readonly version: number; readonly key: Buffer };

export function tokenKeyOf(encoded: string, version = 1): TokenKey {
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes, base64-encoded");
  return { version, key };
}

export function sealToken(key: TokenKey, libraryId: string, token: string): string {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key.key, nonce, { authTagLength: 16 });
  cipher.setAAD(Buffer.from(libraryId, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return [`v${key.version}`, ...[nonce, cipher.getAuthTag(), ciphertext].map((part) => part.toString("base64url"))].join(".");
}

// Throws when the key version is unknown or the sealed token was altered or belongs to
// another library.
export function openToken(keys: readonly TokenKey[], libraryId: string, sealed: string): string {
  const [version, nonce, tag, ciphertext] = sealed.split(".");
  const key = keys.find((candidate) => `v${candidate.version}` === version);
  if (key === undefined || nonce === undefined || tag === undefined || ciphertext === undefined) throw new Error("sealed token has an unknown key or form");
  const decipher = createDecipheriv("aes-256-gcm", key.key, Buffer.from(nonce, "base64url"), { authTagLength: 16 });
  decipher.setAAD(Buffer.from(libraryId, "utf8"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
}
