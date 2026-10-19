// §4 test identifiers on every interactive element, with the grammar
// {role}-{area}-{name}[-{key}] and unique static values; §5.6 no user-visible literals.
import ts from "typescript";
import type { Repository } from "../repository.ts";
import { lineOf } from "../sourceLines.ts";
import { walk } from "../syntax.ts";
import { testIdOf, type JsxTag } from "../testIds.ts";
import { violation, type Violation } from "../violation.ts";

const interactiveTags = new Set(["button", "input", "select", "textarea", "form", "a"]);
const textAttributes = new Set(["aria-label", "aria-description", "title", "placeholder", "alt", "label"]);

function attributesOf(tag: JsxTag): ts.JsxAttribute[] {
  return tag.attributes.properties.filter(ts.isJsxAttribute);
}

function isInteractive(tag: JsxTag): boolean {
  if (/^[A-Z]/u.test(tag.tagName.getText())) return false;
  const attributes = attributesOf(tag);
  const handler = attributes.some((attribute) => /^on[A-Z]/u.test(attribute.name.getText()));
  const roleButton = attributes.some((a) => a.name.getText() === "role" && a.initializer?.getText() === '"button"');
  return interactiveTags.has(tag.tagName.getText()) || handler || roleButton;
}

function literalViolations(file: string, source: ts.SourceFile, node: ts.Node): Violation[] {
  if (ts.isJsxText(node) && /[\p{L}\p{N}]/u.test(node.text)) {
    return [violation("§5.6", file, `user-visible literal "${node.text.trim()}"`, lineOf(source, node))];
  }
  const literalText = ts.isJsxAttribute(node) && node.initializer !== undefined && ts.isStringLiteral(node.initializer);
  if (literalText && textAttributes.has(node.name.getText()) && /\p{L}/u.test(node.initializer.getText())) {
    return [violation("§5.6", file, `user-visible attribute literal ${node.getText()}`, lineOf(source, node))];
  }
  return [];
}

function viewViolations(file: string, source: ts.SourceFile, staticIds: Map<string, string>): Violation[] {
  const found: Violation[] = [];
  walk(source, (node) => {
    found.push(...literalViolations(file, source, node));
    if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) return;
    const id = testIdOf(node);
    if (id.kind === "missing" && isInteractive(node)) found.push(violation("§4.1", file, `interactive <${node.tagName.getText()}> has no data-testid`, lineOf(source, node)));
    if (id.kind === "invalid") found.push(violation("§4.2", file, `data-testid ${id.value} breaks {role}-{area}-{name}[-{key}]`, lineOf(source, node)));
    if (id.kind === "static" && staticIds.has(id.value)) found.push(violation("§4.3", file, `data-testid ${id.value} also used in ${staticIds.get(id.value)}`, lineOf(source, node)));
    if (id.kind === "static") staticIds.set(id.value, file);
  });
  return found;
}

export function checkViews(repository: Repository): Violation[] {
  const staticIds = new Map<string, string>();
  const views = repository.files.filter((file) => file.endsWith(".tsx") && repository.role(file) === "VIEW");
  return views.flatMap((file) => viewViolations(file, repository.source(file), staticIds));
}
