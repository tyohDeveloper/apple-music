// A rule failure, citing the section of docs/standards/portable-v2.2.md it enforces (§7.8).
export type Violation = {
  readonly section: string;
  readonly file: string;
  readonly line?: number;
  readonly message: string;
};

export function violation(section: string, file: string, message: string, line?: number): Violation {
  return line === undefined ? { section, file, message } : { section, file, message, line };
}
