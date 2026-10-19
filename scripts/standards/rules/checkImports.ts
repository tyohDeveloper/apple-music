// §1 dependency direction, deployment boundaries and library restrictions by role.
import { matchesAny } from "../globToRegExp.ts";
import { isCode, type Repository } from "../repository.ts";
import { lineOf } from "../sourceLines.ts";
import { importsOf, packageNameOf, resolveRelative, type ImportReference } from "../syntax.ts";
import { violation, type Violation } from "../violation.ts";

function resolveTarget(repository: Repository, target: string): string {
  const candidates = [target, `${target}.ts`, `${target}.tsx`];
  return candidates.find((candidate) => repository.files.includes(candidate)) ?? target;
}

function checkRelative(repository: Repository, file: string, reference: ImportReference, target: string): Violation[] {
  const line = lineOf(repository.source(file), reference.node);
  const fromRole = repository.role(file) ?? "";
  const toRole = repository.role(target) ?? "";
  const allowed = repository.architecture.mayImport[fromRole];
  const found: Violation[] = [];
  if (allowed !== undefined && !allowed.includes(toRole)) {
    found.push(violation("§1", file, `${fromRole} may not import ${toRole} (${reference.specifier})`, line));
  }
  for (const boundary of repository.architecture.boundaries) {
    if (matchesAny(file, [boundary.from]) && matchesAny(target, boundary.mayNotImport)) {
      found.push(violation("§1", file, `deployment boundary: ${boundary.from} may not import ${target}`, line));
    }
  }
  return found;
}

function checkPackage(repository: Repository, file: string, reference: ImportReference): Violation[] {
  if (reference.typeOnly) return [];
  const name = packageNameOf(reference.specifier);
  const restriction = repository.architecture.packageRestrictions.find((entry) => matchesAny(name, entry.packages));
  if (restriction === undefined || matchesAny(file, restriction.allowedIn)) return [];
  const line = lineOf(repository.source(file), reference.node);
  return [violation("§1", file, `${name} may only be imported in ${restriction.allowedIn.join(", ")}`, line)];
}

function checkFile(repository: Repository, file: string): Violation[] {
  return importsOf(repository.source(file)).flatMap((reference) => {
    const target = resolveRelative(file, reference.specifier);
    if (target === null) return checkPackage(repository, file, reference);
    return checkRelative(repository, file, reference, resolveTarget(repository, target));
  });
}

export function checkImports(repository: Repository): Violation[] {
  return repository.files.filter((file) => file.startsWith("src/") && isCode(file)).flatMap((file) => checkFile(repository, file));
}
