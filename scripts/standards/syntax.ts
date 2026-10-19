// Small AST queries shared by the rules.
import path from "node:path";
import ts from "typescript";

export function walk(node: ts.Node, visit: (node: ts.Node) => void): void {
  visit(node);
  ts.forEachChild(node, (child) => walk(child, visit));
}

export type ImportReference = { readonly specifier: string; readonly typeOnly: boolean; readonly node: ts.Node };

function isTypeOnlyImport(node: ts.ImportDeclaration): boolean {
  const clause = node.importClause;
  if (clause === undefined) return false;
  if (clause.isTypeOnly) return true;
  const bindings = clause.namedBindings;
  if (clause.name !== undefined || bindings === undefined || !ts.isNamedImports(bindings)) return false;
  return bindings.elements.length > 0 && bindings.elements.every((element) => element.isTypeOnly);
}

export function importsOf(source: ts.SourceFile): ImportReference[] {
  const references: ImportReference[] = [];
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      references.push({ specifier: statement.moduleSpecifier.text, typeOnly: isTypeOnlyImport(statement), node: statement });
    }
    if (ts.isExportDeclaration(statement) && statement.moduleSpecifier !== undefined && ts.isStringLiteral(statement.moduleSpecifier)) {
      references.push({ specifier: statement.moduleSpecifier.text, typeOnly: statement.isTypeOnly, node: statement });
    }
  }
  return references;
}

export function resolveRelative(fromFile: string, specifier: string): string | null {
  if (!specifier.startsWith(".")) return null;
  return path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), specifier));
}

export function packageNameOf(specifier: string): string {
  if (specifier.startsWith("node:")) return specifier;
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : (parts[0] ?? specifier);
}

export function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((modifier) => modifier.kind === kind);
}

export function baseNameOf(file: string): string {
  return path.posix.basename(file).replace(/\.(test|spec)?\.?(tsx?|json|mjs)$/u, "").replace(/\.$/u, "");
}
