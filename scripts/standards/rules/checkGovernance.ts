// §11 exceptions expire; §10 the license, and attribution of every package reachable from
// browser code; ADR-0001 the adopted policy copy is unedited; §1.9 MODEL paths belong to a
// datastore this repository solely owns; §0 docs/ARCHITECTURE.md agrees with architecture.json.
import { createHash } from "node:crypto";
import { isCode, type Repository } from "../repository.ts";
import { commentsOf } from "../sourceLines.ts";
import { importsOf, packageNameOf, resolveRelative } from "../syntax.ts";
import { violation, type Violation } from "../violation.ts";

const self = "tyohDeveloper/apple-music";

function exceptionViolations(repository: Repository): Violation[] {
  const manifest = JSON.parse(repository.text(".architecture-exceptions.json")) as { exceptions: { id: string; expires: string; owner: string; section: string }[] };
  const expired = manifest.exceptions.filter((entry) => !(entry.expires >= repository.today) || entry.owner === "" || entry.section === "");
  const inline = repository.files.filter((file) => (file.startsWith("src/") || file.startsWith("scripts/")) && isCode(file)).flatMap((file) =>
    commentsOf(repository.source(file))
      .filter((comment) => comment.text.includes("EXCEPTION [coding-standards"))
      .filter((comment) => !((/Expires:\s*(\d{4}-\d{2}-\d{2})/u.exec(comment.text)?.[1] ?? "") >= repository.today))
      .map((comment) => violation("§11", file, "inline exception has expired or has no Expires date", comment.line)),
  );
  return [...expired.map((entry) => violation("§11", ".architecture-exceptions.json", `${entry.id} has expired or lacks owner or section`)), ...inline];
}

function policyCopyViolations(repository: Repository): Violation[] {
  const manifest = JSON.parse(repository.text("docs/standards/source-manifest.json")) as { copies: { path: string; sha256: string }[] };
  return manifest.copies
    .filter((copy) => createHash("sha256").update(repository.text(copy.path)).digest("hex") !== copy.sha256)
    .map((copy) => violation("ADR-0001", copy.path, "standards copy differs from its recorded hash"));
}

function browserPackagesOf(repository: Repository): Set<string> {
  const pending = repository.files.filter((file) => file.startsWith("src/browser/") && isCode(file));
  const seen = new Set<string>();
  const packages = new Set<string>();
  for (let file = pending.pop(); file !== undefined; file = pending.pop()) {
    if (seen.has(file)) continue;
    seen.add(file);
    for (const reference of importsOf(repository.source(file)).filter((entry) => !entry.typeOnly)) {
      const target = resolveRelative(file, reference.specifier);
      if (target === null) packages.add(packageNameOf(reference.specifier));
      else if (isCode(target) && repository.files.includes(target)) pending.push(target);
    }
  }
  return packages;
}

function licenseViolations(repository: Repository): Violation[] {
  const license = repository.text("LICENSE");
  const found = license.startsWith("MIT License") && license.includes("David Hoyt") ? [] : [violation("§10.1", "LICENSE", "not the MIT license for David Hoyt")];
  const attributions = JSON.parse(repository.text("THIRD_PARTY_LICENSES.json")) as { packages: { name: string }[] };
  const listed = new Set(attributions.packages.map((entry) => entry.name));
  const missing = [...browserPackagesOf(repository)].filter((name) => !listed.has(name));
  return [...found, ...missing.map((name) => violation("§10.3", "THIRD_PARTY_LICENSES.json", `${name} ships in the browser bundle and is not attributed`))];
}

function ownershipViolations(repository: Repository): Violation[] {
  const ownership = JSON.parse(repository.text("datastore-ownership.json")) as { datastores: { role: string; schemaOwner: string; writers: string[]; paths: string[] }[] };
  const modelPaths = repository.architecture.roles.find((entry) => entry.role === "MODEL")?.paths ?? [];
  const owned = ownership.datastores.filter((store) => store.role === "MODEL" && store.schemaOwner === self && store.writers.length === 1 && store.writers[0] === self);
  const covered = modelPaths.every((path) => owned.some((store) => store.paths.includes(path)));
  return covered ? [] : [violation("§1.9", "datastore-ownership.json", "MODEL paths must belong to a datastore this repository solely owns and writes")];
}

function mappingTableViolations(repository: Repository): Violation[] {
  const rows = repository.text("docs/ARCHITECTURE.md").split("\n").filter((line) => line.startsWith("| "));
  return repository.architecture.roles.flatMap((entry) => {
    const row = rows.find((line) => line.startsWith(`| ${entry.role} |`));
    const cell = row?.split("|")[2] ?? "";
    const documented = [...cell.matchAll(/`([^`]+)`/gu)].map((match) => match[1] ?? "");
    const expected = entry.allowlist !== undefined ? [entry.allowlist] : [...entry.paths];
    return documented.join(" ") === expected.join(" ") ? [] : [violation("§0", "docs/ARCHITECTURE.md", `${entry.role} paths disagree with architecture.json`)];
  });
}

export function checkGovernance(repository: Repository): Violation[] {
  return [
    ...exceptionViolations(repository),
    ...policyCopyViolations(repository),
    ...licenseViolations(repository),
    ...ownershipViolations(repository),
    ...mappingTableViolations(repository),
  ];
}
