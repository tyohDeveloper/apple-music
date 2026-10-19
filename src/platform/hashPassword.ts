// PLATFORM-AMBIENT: argon2id hashing draws a random salt (mandated binding, .architecture-bindings.json).
import argon2 from "argon2";

export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}
