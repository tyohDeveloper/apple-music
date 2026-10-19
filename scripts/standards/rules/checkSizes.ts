// §3.1 function bodies ≤ 20 code lines; §3.4 a VIEW render body may hold up to 80 lines of
// markup in its return statement; §3.3 file length by role. Comment-only and blank lines
// do not count.
import ts from "typescript";
import { maxLinesOf } from "../architecture.ts";
import { isCode, type Repository } from "../repository.ts";
import { codeLinesOf, countCodeLines, lineOf } from "../sourceLines.ts";
import { walk } from "../syntax.ts";
import { violation, type Violation } from "../violation.ts";

const functionLimit = 20;
const markupLimit = 80;

type Span = { readonly first: number; readonly last: number };

function spanOf(source: ts.SourceFile, node: ts.Node): Span {
  return {
    first: source.getLineAndCharacterOfPosition(node.getStart(source)).line,
    last: source.getLineAndCharacterOfPosition(node.getEnd()).line,
  };
}

function markupReturnOf(body: ts.Block): ts.ReturnStatement | null {
  const last = body.statements.at(-1);
  if (last === undefined || !ts.isReturnStatement(last) || last.expression === undefined) return null;
  let expression: ts.Expression = last.expression;
  while (ts.isParenthesizedExpression(expression)) expression = expression.expression;
  return ts.isJsxElement(expression) || ts.isJsxFragment(expression) || ts.isJsxSelfClosingElement(expression) ? last : null;
}

function measure(source: ts.SourceFile, lines: ReadonlySet<number>, body: ts.ConciseBody, isView: boolean) {
  const span = spanOf(source, body);
  const inner = ts.isBlock(body) ? { first: span.first + 1, last: span.last - 1 } : span;
  const total = countCodeLines(lines, inner.first, inner.last);
  const markup = isView && ts.isBlock(body) ? markupReturnOf(body) : null;
  if (markup === null) return { logic: total, markup: 0 };
  const markupSpan = spanOf(source, markup);
  const markupLines = countCodeLines(lines, markupSpan.first, markupSpan.last);
  return { logic: total - markupLines, markup: markupLines };
}

function functionViolations(repository: Repository, file: string): Violation[] {
  const source = repository.source(file);
  const lines = codeLinesOf(source);
  const isView = repository.role(file) === "VIEW";
  const found: Violation[] = [];
  walk(source, (node) => {
    if (!ts.isFunctionLike(node) || !("body" in node) || node.body === undefined) return;
    const size = measure(source, lines, node.body as ts.ConciseBody, isView);
    const line = lineOf(source, node);
    if (size.logic > functionLimit) found.push(violation("§3.1", file, `function body has ${size.logic} lines (limit ${functionLimit})`, line));
    if (size.markup > markupLimit) found.push(violation("§3.4", file, `render markup has ${size.markup} lines (limit ${markupLimit})`, line));
  });
  return found;
}

function fileViolations(repository: Repository, file: string): Violation[] {
  const limit = maxLinesOf(repository.architecture, repository.role(file) ?? "");
  if (limit === null) return [];
  const count = codeLinesOf(repository.source(file)).size;
  return count > limit ? [violation("§3.3", file, `file has ${count} code lines (limit ${limit} for ${repository.role(file)})`)] : [];
}

export function checkSizes(repository: Repository): Violation[] {
  const files = repository.files.filter((file) => (file.startsWith("src/") || file.startsWith("scripts/") || file.endsWith(".config.ts")) && isCode(file));
  return files.flatMap((file) => [...functionViolations(repository, file), ...fileViolations(repository, file)]);
}
