// Mandated bindings (docs/standards/portable-v2.2.md §18.2): every org-mandated binding in
// .architecture-bindings.json resolves, for its deployment target, to the approved module,
// version and integrity in package.json, package-lock.json, the installed tree and the built
// server. Review dates are reported when due; standing bindings do not expire (§18.3).
// Run after `npm run bundle`.
import { existsSync, readFileSync } from "node:fs";

type BindingTarget = {
  readonly target: string;
  readonly specifier: string;
  readonly version: string;
  readonly integrity: string;
  readonly importedBy: readonly string[];
};
type Binding = { readonly id: string; readonly authority: string; readonly owner: string; readonly reviewOn: string; readonly targets: readonly BindingTarget[] };
type LockEntry = { readonly version?: string; readonly integrity?: string };

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

const manifest = readJson<{ bindings: readonly Binding[] }>(".architecture-bindings.json");
const lock = readJson<{ packages: Readonly<Record<string, LockEntry>> }>("package-lock.json");
const declared = readJson<{ dependencies: Readonly<Record<string, string>> }>("package.json").dependencies;
const builtRoots: Readonly<Record<string, string>> = { server: "dist/server" };

function importsSpecifier(path: string, specifier: string): boolean {
  const escaped = specifier.replace(/[.*+?^${}()|[\]\\/]/gu, "\\$&");
  return new RegExp(`from\\s*["']${escaped}(/[^"']*)?["']`, "u").test(readFileSync(path, "utf8"));
}

function installedVersionOf(specifier: string): string {
  const path = `node_modules/${specifier}/package.json`;
  return existsSync(path) ? readJson<{ version: string }>(path).version : "missing";
}

function artifactProblems(target: BindingTarget): string[] {
  const root = builtRoots[target.target];
  if (root === undefined) return [`no built artifact is known for target ${target.target}`];
  return target.importedBy.flatMap((source) => {
    const built = `${root}/${source.replace(/\.tsx?$/u, ".js")}`;
    if (!existsSync(built)) return [`${built} is missing; run npm run bundle first`];
    return importsSpecifier(built, target.specifier) ? [] : [`${built} does not import ${target.specifier}`];
  });
}

function targetProblems(binding: Binding, target: BindingTarget): string[] {
  const locked = lock.packages[`node_modules/${target.specifier}`];
  const problems: string[] = [];
  if (declared[target.specifier] !== target.version) problems.push(`package.json pins ${declared[target.specifier] ?? "nothing"}`);
  if (locked?.version !== target.version) problems.push(`package-lock.json resolves ${locked?.version ?? "nothing"}`);
  if (locked?.integrity !== target.integrity) problems.push("package-lock.json integrity differs from the manifest");
  if (installedVersionOf(target.specifier) !== target.version) problems.push(`installed version is ${installedVersionOf(target.specifier)}`);
  problems.push(...artifactProblems(target));
  return problems.map((problem) => `§18.2 ${binding.id} ${target.target} ${target.specifier}@${target.version}: ${problem}`);
}

const today = new Date().toISOString().slice(0, 10);
const mandated = manifest.bindings.filter((binding) => binding.authority === "org-mandated");
const problems = mandated.flatMap((binding) => binding.targets.flatMap((target) => targetProblems(binding, target)));
for (const binding of manifest.bindings.filter((entry) => entry.reviewOn < today)) {
  console.warn(`§18.3 ${binding.id}: annual review was due ${binding.reviewOn}; owner ${binding.owner}`);
}
for (const problem of problems) console.error(problem);
console.log(problems.length === 0 ? `Bindings check passed (${mandated.length} org-mandated bindings).` : `${problems.length} binding mismatches.`);
process.exitCode = problems.length === 0 ? 0 : 1;
