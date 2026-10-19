// §1.3, §1.4: no ambient clock, randomness, DOM or IO in VIEW, STATE, PURE or PLATFORM-PURE;
// no module-level mutable state in PURE or STATE; `fetch` and `process.env` only where mapped.
import ts from "typescript";
import { matchesAny } from "../globToRegExp.ts";
import { isCode, type Repository } from "../repository.ts";
import { lineOf } from "../sourceLines.ts";
import { walk } from "../syntax.ts";
import { violation, type Violation } from "../violation.ts";

function isReference(node: ts.Identifier): boolean {
  const parent = node.parent;
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return false;
  if ((ts.isPropertyAssignment(parent) || ts.isPropertySignature(parent)) && parent.name === node) return false;
  if (ts.isBindingElement(parent) || ts.isVariableDeclaration(parent) || ts.isParameter(parent)) return parent.name !== node;
  if (ts.isImportSpecifier(parent) || ts.isImportClause(parent) || ts.isJsxAttribute(parent)) return false;
  if (ts.isShorthandPropertyAssignment(parent) || ts.isQualifiedName(parent)) return false;
  return !ts.isTypeReferenceNode(parent) && !ts.isMethodDeclaration(parent) && !ts.isPropertyDeclaration(parent);
}

function ambientNameOf(node: ts.Node): string | null {
  if (ts.isNewExpression(node) && node.expression.getText() === "Date" && (node.arguments ?? []).length === 0) return "new Date()";
  if (ts.isPropertyAccessExpression(node)) return node.getText().replace(/\s+/gu, "");
  if (ts.isIdentifier(node) && isReference(node)) return node.text;
  return null;
}

function usageViolations(repository: Repository, file: string, name: string, node: ts.Node): Violation[] {
  const { ambient, globalRestrictions } = repository.architecture;
  const line = lineOf(repository.source(file), node);
  const restricted = globalRestrictions.find((entry) => entry.global === name);
  if (restricted !== undefined && !matchesAny(file, restricted.allowedIn)) {
    return [violation("§1", file, `${name} is only permitted in ${restricted.allowedIn.join(", ")}`, line)];
  }
  const ambientBanned = ambient.forbiddenInRoles.includes(repository.role(file) ?? "");
  const isAmbient = ambient.identifiers.includes(name) || name === "new Date()";
  return ambientBanned && isAmbient ? [violation("§1.4", file, `ambient ${name} in ${repository.role(file)}`, line)] : [];
}

function moduleStateViolations(repository: Repository, file: string): Violation[] {
  if (!["PURE", "PURE-CORE", "STATE"].includes(repository.role(file) ?? "")) return [];
  const source = repository.source(file);
  return source.statements
    .filter((statement) => ts.isVariableStatement(statement) && (statement.declarationList.flags & ts.NodeFlags.Const) === 0)
    .map((statement) => violation("§1.4", file, "module-level mutable state", lineOf(source, statement)));
}

function checkFile(repository: Repository, file: string): Violation[] {
  const found: Violation[] = moduleStateViolations(repository, file);
  walk(repository.source(file), (node) => {
    const name = ambientNameOf(node);
    if (name !== null) found.push(...usageViolations(repository, file, name, node));
  });
  return found;
}

export function checkAmbient(repository: Repository): Violation[] {
  return repository.files.filter((file) => file.startsWith("src/") && isCode(file)).flatMap((file) => checkFile(repository, file));
}
