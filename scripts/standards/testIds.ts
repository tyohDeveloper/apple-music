// The §4.2 test-identifier grammar {role}-{area}-{name}[-{key}] and how a JSX tag's
// data-testid is classified: a static value, the literal head of a keyed template, invalid,
// or missing. Shared by the standards check and the artifact verifier.
import ts from "typescript";

const roles = "button|select|input|display|text|switch|checkbox|slider|panel|backdrop|tab";
const staticId = new RegExp(`^(${roles})(-[a-z0-9]+)+$`, "u");
const keyedPrefix = new RegExp(`^(${roles})(-[a-z0-9]+)+-$`, "u");

export type JsxTag = ts.JsxOpeningElement | ts.JsxSelfClosingElement;
export type TestId = { readonly kind: "static" | "keyed" | "invalid" | "missing"; readonly value: string };

export function testIdOf(tag: JsxTag): TestId {
  const attribute = tag.attributes.properties.find((property) => ts.isJsxAttribute(property) && property.name.getText() === "data-testid");
  const initializer = attribute !== undefined && ts.isJsxAttribute(attribute) ? attribute.initializer : undefined;
  if (initializer === undefined) return { kind: "missing", value: "" };
  if (ts.isStringLiteral(initializer)) return { kind: staticId.test(initializer.text) ? "static" : "invalid", value: initializer.text };
  const expression = ts.isJsxExpression(initializer) ? initializer.expression : undefined;
  if (expression !== undefined && ts.isTemplateExpression(expression)) {
    return { kind: keyedPrefix.test(expression.head.text) ? "keyed" : "invalid", value: expression.head.text };
  }
  return { kind: "invalid", value: initializer.getText() };
}
