// The page a stored external identifier links to, or null when its namespace has none.
import { externalIdFormatOf, type ExternalIdOwner } from "./externalIdFormatOf.ts";

export function externalIdLinkOf(owner: ExternalIdOwner, namespace: string, value: string): string | null {
  const link = externalIdFormatOf(owner, namespace)?.link;
  return link === undefined ? null : link.replace("{value}", encodeURIComponent(value));
}
