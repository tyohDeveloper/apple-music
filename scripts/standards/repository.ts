// The files under check and cached access to their text and syntax trees.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { loadArchitecture, roleOf, type Architecture } from "./architecture.ts";

export type Repository = {
  readonly architecture: Architecture;
  readonly files: readonly string[];
  readonly today: string;
  readonly text: (path: string) => string;
  readonly source: (path: string) => ts.SourceFile;
  readonly role: (path: string) => string | null;
};

function listFiles(): string[] {
  const output = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { encoding: "utf8" });
  return output.split("\n").filter((path) => path !== "" && !path.startsWith("dist/"));
}

function memoize<T>(load: (path: string) => T): (path: string) => T {
  const cache = new Map<string, T>();
  return (path) => {
    const cached = cache.get(path);
    if (cached !== undefined) return cached;
    const value = load(path);
    cache.set(path, value);
    return value;
  };
}

export function openRepository(today: string): Repository {
  const architecture = loadArchitecture();
  const text = memoize((path) => readFileSync(path, "utf8"));
  const kind = (path: string) => (path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const source = memoize((path) => ts.createSourceFile(path, text(path), ts.ScriptTarget.Latest, true, kind(path)));
  return { architecture, files: listFiles(), today, text, source, role: (path) => roleOf(architecture, path) };
}

export function isCode(path: string): boolean {
  return /\.(ts|tsx)$/u.test(path) && !path.endsWith(".d.ts");
}
