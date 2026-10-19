// Line accounting with the TypeScript scanner, so comments and blank lines are told apart
// from code without regular expressions (§7.4).
import ts from "typescript";

export function codeLinesOf(source: ts.SourceFile): ReadonlySet<number> {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, source.languageVariant, source.text);
  const lines = new Set<number>();
  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
    const first = source.getLineAndCharacterOfPosition(scanner.getTokenStart()).line;
    const last = source.getLineAndCharacterOfPosition(scanner.getTokenEnd()).line;
    for (let line = first; line <= last; line += 1) lines.add(line);
  }
  return lines;
}

export function countCodeLines(lines: ReadonlySet<number>, firstLine: number, lastLine: number): number {
  let count = 0;
  for (let line = firstLine; line <= lastLine; line += 1) if (lines.has(line)) count += 1;
  return count;
}

export function commentsOf(source: ts.SourceFile): readonly { readonly text: string; readonly line: number }[] {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, source.languageVariant, source.text);
  const comments: { text: string; line: number }[] = [];
  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
    if (token !== ts.SyntaxKind.SingleLineCommentTrivia && token !== ts.SyntaxKind.MultiLineCommentTrivia) continue;
    const line = source.getLineAndCharacterOfPosition(scanner.getTokenStart()).line + 1;
    comments.push({ text: scanner.getTokenText(), line });
  }
  return comments;
}

export function lineOf(source: ts.SourceFile, node: ts.Node): number {
  return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
}
