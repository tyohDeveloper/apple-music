// docs/ARCHITECTURE.md role mapping: every file under the mapped trees has exactly one role.
import type { Repository } from "../repository.ts";
import { violation, type Violation } from "../violation.ts";

const mappedTrees = ["src/", "data/", "drizzle/", "scripts/", "tests/"];

export function checkRoleCoverage(repository: Repository): Violation[] {
  const unmapped = repository.files.filter(
    (file) => mappedTrees.some((tree) => file.startsWith(tree)) && repository.role(file) === null,
  );
  return unmapped.map((file) => violation("§0", file, "file matches no role in architecture.json"));
}
