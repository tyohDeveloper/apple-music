// The real repository with planted files laid over it, so each standards rule can be shown
// to fire on a known violation (a planted-truth control for the checker itself).
import ts from "typescript";
import { openRepository, type Repository } from "../../../scripts/standards/repository.ts";

export function overlayRepository(planted: Readonly<Record<string, string>>, today: string): Repository {
  const base = openRepository(today);
  const plantedSource = (path: string, text: string) =>
    ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  return {
    ...base,
    files: [...new Set([...base.files, ...Object.keys(planted)])],
    text: (path) => planted[path] ?? base.text(path),
    source: (path) => {
      const text = planted[path];
      return text === undefined ? base.source(path) : plantedSource(path, text);
    },
  };
}
