// PLATFORM-PURE: verification is deterministic for a given hash and password
// (mandated binding, .architecture-bindings.json; listed in platform-pure-allowlist.json).
import argon2 from "argon2";

export function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}
