// The single cascade-resolve function (§5.4, §15.1): the first catalog that has the key
// wins, in order requested locale → base locale; otherwise the raw key is returned.
export function resolveMessage(
  catalogs: readonly Readonly<Record<string, string>>[],
  key: string,
): string {
  for (const catalog of catalogs) {
    const message = catalog[key];
    if (message !== undefined) return message;
  }
  return key;
}
