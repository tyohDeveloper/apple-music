// §3.8 names for responsibility, not shape; reserved adapter names stay out of REMOTE.
import { isCode, type Repository } from "../repository.ts";
import { violation, type Violation } from "../violation.ts";

const shapeNames = new Set([
  "helpers", "utils", "misc", "common", "shared", "handlers", "setters", "getters", "stuff", "things",
  "lib", "index", "types", "usehelpers", "usehandlers", "usesetters",
]);
const reservedAdapterNames = new Set(["client", "stub", "connector", "gateway"]);

function segmentsOf(file: string): string[] {
  return file.split("/").map((segment) => segment.replace(/(\.(test|spec))?\.[a-z]+$/u, "").toLowerCase());
}

function nameViolations(repository: Repository, file: string): Violation[] {
  const segments = segmentsOf(file);
  const found: Violation[] = [];
  const shape = segments.find((segment) => shapeNames.has(segment));
  if (shape !== undefined) found.push(violation("§3.8", file, `shape name "${shape}"`));
  const reserved = segments.find((segment) => reservedAdapterNames.has(segment));
  if (reserved !== undefined && repository.role(file) === "REMOTE") found.push(violation("§3.8", file, `reserved adapter name "${reserved}"`));
  return found;
}

export function checkNames(repository: Repository): Violation[] {
  const scoped = repository.files.filter((file) => isCode(file) && ["src/", "scripts/", "tests/"].some((tree) => file.startsWith(tree)));
  return scoped.flatMap((file) => nameViolations(repository, file));
}
