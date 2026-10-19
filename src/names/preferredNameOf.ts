// The name a performer is displayed under: the one name marked preferred (invariant 3).
export type NamedOption = { readonly name: string; readonly isPreferred: boolean };

export function preferredNameOf(names: readonly NamedOption[]): string {
  return names.find((name) => name.isPreferred)?.name ?? "";
}
