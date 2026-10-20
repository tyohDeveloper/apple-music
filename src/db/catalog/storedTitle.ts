// A title as stored: whitespace collapsed, beside the match key that search compares.
import { collapseWhitespace } from "../../names/collapseWhitespace.ts";
import { matchKeyOf } from "../../names/matchKeyOf.ts";

export function storedTitle(title: string): { readonly title: string; readonly matchKey: string } {
  const collapsed = collapseWhitespace(title);
  return { title: collapsed, matchKey: matchKeyOf(collapsed) };
}
