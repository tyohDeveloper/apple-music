// §8.1 every exported PURE function has a unit test at tests/unit/<path>.test.ts that
// imports it; §8.2 every action type of every reducer appears in that reducer's test.
import ts from "typescript";
import type { Repository } from "../repository.ts";
import { hasModifier, walk } from "../syntax.ts";
import { violation, type Violation } from "../violation.ts";

function unitTestPathOf(file: string): string {
  return `tests/unit/${file.replace(/^src\//u, "").replace(/\.tsx?$/u, "")}.test.ts`;
}

function pureTestViolations(repository: Repository, file: string): Violation[] {
  const exportsFunction = repository.source(file).statements.some(
    (statement) => ts.isFunctionDeclaration(statement) && hasModifier(statement, ts.SyntaxKind.ExportKeyword),
  );
  if (!exportsFunction) return [];
  const testFile = unitTestPathOf(file);
  if (!repository.files.includes(testFile)) return [violation("§8.1", file, `no unit test at ${testFile}`)];
  const moduleName = file.split("/").at(-1) ?? file;
  return repository.text(testFile).includes(moduleName) ? [] : [violation("§8.1", testFile, `does not import ${moduleName}`)];
}

function actionTypesOf(source: ts.SourceFile): string[] {
  const types: string[] = [];
  walk(source, (node) => {
    if (!ts.isPropertySignature(node) || node.name.getText(source) !== "type" || node.type === undefined) return;
    if (ts.isLiteralTypeNode(node.type) && ts.isStringLiteral(node.type.literal)) types.push(node.type.literal.text);
  });
  return types;
}

function reducerTestViolations(repository: Repository, file: string): Violation[] {
  const testFile = unitTestPathOf(file.replace(/Actions\.ts$/u, "Reducer.ts"));
  if (!repository.files.includes(testFile)) return [violation("§8.2", file, `no reducer test at ${testFile}`)];
  const text = repository.text(testFile);
  return actionTypesOf(repository.source(file))
    .filter((type) => !text.includes(type))
    .map((type) => violation("§8.2", testFile, `no transition test names action ${type}`));
}

export function checkTests(repository: Repository): Violation[] {
  const pure = repository.files.filter((file) => ["PURE", "PURE-CORE"].includes(repository.role(file) ?? "") && /\.tsx?$/u.test(file));
  const actions = repository.files.filter((file) => repository.role(file) === "STATE" && file.endsWith("Actions.ts"));
  return [...pure.flatMap((file) => pureTestViolations(repository, file)), ...actions.flatMap((file) => reducerTestViolations(repository, file))];
}
