// Display-name key for a taxonomy entry: <taxonomy>.<entry id> (display-name domain, §15.5).
export function displayNameKey(taxonomy: string, entryId: string): string {
  return `${taxonomy}.${entryId}`;
}
