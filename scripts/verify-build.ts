// Built-artifact verifier (docs/standards/portable-v2.2.md §7.2). The client bundle's gzip
// size stays within scripts/build-baseline.json × 1.05 (§7.6); every test identifier in a
// VIEW source ships exactly once (§4.3, §4.4); the content security policy grants no unsafe
// source and the page has no inline script or handler; no server secret, environment name
// or connection string reaches the browser. Regex is used only on the artifact and JSON (§7.4).
import { readdirSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import ts from "typescript";
import { openRepository } from "./standards/repository.ts";
import { walk } from "./standards/syntax.ts";
import { testIdOf } from "./standards/testIds.ts";

type Baseline = { readonly note: string; readonly gzipBytes: { readonly js: number; readonly css: number } };

const clientRoot = "dist/client";
const tolerance = 1.05;

function assetsOf(extension: string): string[] {
  const assets = readdirSync(`${clientRoot}/assets`).filter((file) => file.endsWith(extension));
  return assets.map((file) => `${clientRoot}/assets/${file}`);
}

function gzipBytesOf(files: readonly string[]): number {
  return files.reduce((total, file) => total + gzipSync(readFileSync(file), { level: 9 }).length, 0);
}

function sizeProblems(): string[] {
  const baseline = JSON.parse(readFileSync("scripts/build-baseline.json", "utf8")) as Baseline;
  return (["js", "css"] as const).flatMap((kind) => {
    const measured = gzipBytesOf(assetsOf(`.${kind}`));
    const limit = Math.floor(baseline.gzipBytes[kind] * tolerance);
    console.log(`client ${kind}: ${measured} bytes gzip (baseline ${baseline.gzipBytes[kind]}, limit ${limit})`);
    if (measured <= limit) return [];
    return [`§7.6 client ${kind} is ${measured} bytes gzip, over ${limit}; update scripts/build-baseline.json in a reviewed change with a note`];
  });
}

function sourceTestIds(): string[] {
  const repository = openRepository(new Date().toISOString().slice(0, 10));
  const views = repository.files.filter((file) => file.endsWith(".tsx") && repository.role(file) === "VIEW");
  return views.flatMap((file) => {
    const found: string[] = [];
    walk(repository.source(file), (node) => {
      if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) return;
      const id = testIdOf(node);
      if (id.kind === "static" || id.kind === "keyed") found.push(id.value);
    });
    return found;
  });
}

function shippedTestIdCounts(): Map<string, number> {
  const pattern = /"data-testid":\s*(?:"([^"]*)"|'([^']*)'|`([^`$]*))/gu;
  const counts = new Map<string, number>();
  for (const file of assetsOf(".js")) {
    for (const match of readFileSync(file, "utf8").matchAll(pattern)) {
      const id = match[1] ?? match[2] ?? match[3] ?? "";
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return counts;
}

function testIdProblems(): string[] {
  const counts = shippedTestIdCounts();
  const duplicated = [...counts].filter(([, count]) => count > 1).map(([id, count]) => `§4.3 data-testid ${id} appears ${count} times in the bundle`);
  const stripped = sourceTestIds().filter((id) => !counts.has(id)).map((id) => `§4.4 data-testid ${id} is missing from the bundle`);
  console.log(`test identifiers shipped: ${counts.size}`);
  return [...duplicated, ...stripped];
}

function policyProblems(): string[] {
  const policy = JSON.parse(readFileSync("data/security/content-security-policy.json", "utf8")) as { directives: Record<string, string[]> };
  return Object.entries(policy.directives).flatMap(([directive, sources]) =>
    sources.filter((source) => source.startsWith("'unsafe-") || source === "*").map((source) => `security: ${directive} allows ${source}`),
  );
}

function pageProblems(): string[] {
  const html = readFileSync(`${clientRoot}/index.html`, "utf8");
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/giu)];
  const inline = scripts.filter((match) => !/\bsrc=/iu.test(match[1] ?? "") || (match[2] ?? "").trim() !== "");
  return [
    ...inline.map(() => "security: index.html has an inline script"),
    ...(/\son[a-z]+\s*=/iu.test(html) ? ["security: index.html has an inline event handler"] : []),
  ];
}

function secretProblems(): string[] {
  const names = readFileSync(".env.example", "utf8").split("\n").flatMap((line) => /^([A-Z][A-Z0-9]*_[A-Z0-9_]+)=/u.exec(line)?.[1] ?? []);
  const markers = [...names.map((name) => new RegExp(`\\b${name}\\b`, "u")), /-----BEGIN [A-Z ]*PRIVATE KEY-----/u, /postgres(ql)?:\/\//u];
  const files = [...assetsOf(".js"), ...assetsOf(".css"), ...assetsOf(".map"), `${clientRoot}/index.html`];
  return files.flatMap((file) => {
    const text = readFileSync(file, "utf8");
    return markers.filter((marker) => marker.test(text)).map((marker) => `security: ${file} contains ${marker.source}`);
  });
}

const problems = [...sizeProblems(), ...testIdProblems(), ...policyProblems(), ...pageProblems(), ...secretProblems()];
for (const problem of problems) console.error(problem);
console.log(problems.length === 0 ? "Build verification passed." : `${problems.length} build verification problems.`);
process.exitCode = problems.length === 0 ? 0 : 1;
