// Loads architecture.json and resolves the role of a repository path. The first matching
// role wins, except that allowlisted PLATFORM-PURE files override PLATFORM-AMBIENT.
import { readFileSync } from "node:fs";
import { matchesAny } from "./globToRegExp.ts";

type RoleEntry = {
  readonly role: string;
  readonly paths: readonly string[];
  readonly allowlist?: string;
  readonly maxFileLines?: number;
};

export type Architecture = {
  readonly roles: readonly RoleEntry[];
  readonly mayImport: Readonly<Record<string, readonly string[]>>;
  readonly boundaries: readonly { readonly from: string; readonly mayNotImport: readonly string[] }[];
  readonly packageRestrictions: readonly { readonly packages: readonly string[]; readonly allowedIn: readonly string[] }[];
  readonly globalRestrictions: readonly { readonly global: string; readonly allowedIn: readonly string[] }[];
  readonly ambient: { readonly forbiddenInRoles: readonly string[]; readonly identifiers: readonly string[] };
  readonly localization: {
    readonly languages: string;
    readonly domains: readonly string[];
    readonly generatedInterfacePrefixes: readonly string[];
  };
  readonly dataSchemas: readonly { readonly files: string; readonly schema: string }[];
  readonly platformPure: readonly string[];
};

export function loadArchitecture(): Architecture {
  const raw = JSON.parse(readFileSync("architecture.json", "utf8")) as Omit<Architecture, "platformPure">;
  const allowlistFile = raw.roles.find((entry) => entry.allowlist !== undefined)?.allowlist ?? "";
  const allowlist = JSON.parse(readFileSync(allowlistFile, "utf8")) as { modules: { path: string }[] };
  return { ...raw, platformPure: allowlist.modules.map((module) => module.path) };
}

export function roleOf(architecture: Architecture, path: string): string | null {
  if (architecture.platformPure.includes(path)) return "PLATFORM-PURE";
  return architecture.roles.find((entry) => matchesAny(path, entry.paths))?.role ?? null;
}

export function maxLinesOf(architecture: Architecture, role: string): number | null {
  return architecture.roles.find((entry) => entry.role === role)?.maxFileLines ?? null;
}
