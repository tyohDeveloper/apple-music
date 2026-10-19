// §15: every locale has every domain with the base locale's keys (§15.2, §15.4); every
// interface key used in code exists and every key is used or generated (§15.8); display
// names match the declared taxonomies exactly.
import ts from "typescript";
import { globToRegExp } from "../globToRegExp.ts";
import { isCode, type Repository } from "../repository.ts";
import { walk } from "../syntax.ts";
import { violation, type Violation } from "../violation.ts";

type Catalog = Record<string, string>;

function json<T>(repository: Repository, file: string): T {
  return JSON.parse(repository.text(file)) as T;
}

function catalogFile(locale: string, domain: string): string {
  return `data/locales/${locale}/${domain}.json`;
}

function shapeViolations(repository: Repository, languages: { base: string; supported: string[] }): Violation[] {
  return repository.architecture.localization.domains.flatMap((domain) => {
    const baseKeys = Object.keys(json<Catalog>(repository, catalogFile(languages.base, domain))).sort().join("\n");
    return languages.supported.flatMap((locale) => {
      const file = catalogFile(locale, domain);
      if (!repository.files.includes(file)) return [violation("§15.2", file, "missing translation domain file")];
      const keys = Object.keys(json<Catalog>(repository, file)).sort().join("\n");
      return keys === baseKeys ? [] : [violation("§15.4", file, `keys differ from ${catalogFile(languages.base, domain)}`)];
    });
  });
}

function literalCallArguments(repository: Repository, callee: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const file of repository.files.filter((path) => path.startsWith("src/") && isCode(path))) {
    walk(repository.source(file), (node) => {
      if (!ts.isCallExpression(node)) return;
      const name = ts.isPropertyAccessExpression(node.expression) ? node.expression.name.text : node.expression.getText();
      const first = node.arguments[0];
      if (name === callee && first !== undefined && ts.isStringLiteral(first)) found.set(first.text, file);
    });
  }
  return found;
}

function interfaceViolations(repository: Repository, base: string): Violation[] {
  const file = catalogFile(base, "interface");
  const catalog = json<Catalog>(repository, file);
  const used = literalCallArguments(repository, "t");
  const generated = repository.architecture.localization.generatedInterfacePrefixes;
  const missing = [...used].filter(([key]) => catalog[key] === undefined);
  const dead = Object.keys(catalog).filter((key) => !used.has(key) && !generated.some((prefix) => key.startsWith(prefix)));
  return [
    ...missing.map(([key, source]) => violation("§15.1", source, `interface key "${key}" is not in ${file}`)),
    ...dead.map((key) => violation("§15.8", file, `interface key "${key}" is never used`)),
  ];
}

function displayNameViolations(repository: Repository, base: string): Violation[] {
  const file = catalogFile(base, "display-names");
  const keys = new Set(Object.keys(json<Catalog>(repository, file)));
  const taxonomyFiles = repository.files.filter((path) => globToRegExp("data/taxonomies/*.json").test(path));
  const expected = new Set(taxonomyFiles.flatMap((path) => {
    const taxonomy = json<{ taxonomy: string; entries: { id: string }[] }>(repository, path);
    return taxonomy.entries.map((entry) => `${taxonomy.taxonomy}.${entry.id}`);
  }));
  return [
    ...[...expected].filter((key) => !keys.has(key)).map((key) => violation("§15.1", file, `missing display name "${key}"`)),
    ...[...keys].filter((key) => !expected.has(key)).map((key) => violation("§15.8", file, `display name "${key}" matches no taxonomy entry`)),
  ];
}

export function checkLocales(repository: Repository): Violation[] {
  const languages = json<{ base: string; supported: string[] }>(repository, repository.architecture.localization.languages);
  return [
    ...shapeViolations(repository, languages),
    ...interfaceViolations(repository, languages.base),
    ...displayNameViolations(repository, languages.base),
  ];
}
