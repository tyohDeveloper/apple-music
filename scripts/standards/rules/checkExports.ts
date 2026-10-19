// §3.2 one exported function per PURE file, named for the file (contracts: one schema
// constant or types only, LI-2); §3.9 no barrels or re-exports anywhere in src/ or scripts/.
import ts from "typescript";
import { isCode, type Repository } from "../repository.ts";
import { lineOf } from "../sourceLines.ts";
import { baseNameOf, hasModifier } from "../syntax.ts";
import { violation, type Violation } from "../violation.ts";

type ExportedValue = { readonly name: string; readonly isFunction: boolean };

function isFunctionInitializer(declaration: ts.VariableDeclaration): boolean {
  const initializer = declaration.initializer;
  return initializer !== undefined && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer));
}

function exportedValuesOf(source: ts.SourceFile): ExportedValue[] {
  const values: ExportedValue[] = [];
  for (const statement of source.statements) {
    if (!hasModifier(statement, ts.SyntaxKind.ExportKeyword)) continue;
    if (ts.isFunctionDeclaration(statement)) values.push({ name: statement.name?.text ?? "default", isFunction: true });
    if (ts.isClassDeclaration(statement)) values.push({ name: statement.name?.text ?? "default", isFunction: false });
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        values.push({ name: declaration.name.getText(source), isFunction: isFunctionInitializer(declaration) });
      }
    }
  }
  return values;
}

function oneExportViolations(repository: Repository, file: string): Violation[] {
  const values = exportedValuesOf(repository.source(file));
  const expected = baseNameOf(file);
  if (file.startsWith("src/contracts/")) {
    const fine = values.length === 0 || (values.length === 1 && values[0]?.name === expected && !values[0].isFunction);
    return fine ? [] : [violation("§3.2", file, `contract files export one schema constant named ${expected}, or types only`)];
  }
  const only = values[0];
  if (values.length === 1 && only !== undefined && only.isFunction && only.name === expected) return [];
  return [violation("§3.2", file, `PURE files export exactly one function named ${expected}; found ${values.map((v) => v.name).join(", ") || "none"}`)];
}

function importedNamesOf(source: ts.SourceFile): Set<string> {
  const names = new Set<string>();
  for (const statement of source.statements) {
    const bindings = ts.isImportDeclaration(statement) ? statement.importClause?.namedBindings : undefined;
    if (bindings !== undefined && ts.isNamedImports(bindings)) for (const element of bindings.elements) names.add(element.name.text);
  }
  return names;
}

function barrelViolations(repository: Repository, file: string): Violation[] {
  const source = repository.source(file);
  const imported = importedNamesOf(source);
  return source.statements.filter(ts.isExportDeclaration).flatMap((statement) => {
    const reExport = statement.moduleSpecifier !== undefined;
    const elements = statement.exportClause !== undefined && ts.isNamedExports(statement.exportClause) ? statement.exportClause.elements : [];
    const relaysImport = elements.some((element) => imported.has((element.propertyName ?? element.name).text));
    return reExport || relaysImport ? [violation("§3.9", file, "re-export statement", lineOf(source, statement))] : [];
  });
}

export function checkExports(repository: Repository): Violation[] {
  const code = repository.files.filter((file) => (file.startsWith("src/") || file.startsWith("scripts/")) && isCode(file));
  const pure = code.filter((file) => ["PURE", "PURE-CORE"].includes(repository.role(file) ?? ""));
  return [...pure.flatMap((file) => oneExportViolations(repository, file)), ...code.flatMap((file) => barrelViolations(repository, file))];
}
