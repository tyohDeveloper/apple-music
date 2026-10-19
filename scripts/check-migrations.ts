// Migration discipline (hosted-Postgres profile, docs/standards/hosted-postgres-profile.md):
// timestamp-prefixed names, a rollback block in every migration, a journal listing exactly
// the migration files in order, applied migrations never edited or removed, and at most one
// migration added per commit. The base is MIGRATIONS_BASE_REF (CI: the previous head of the
// branch or the pull request base), else origin/main.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";

type Journal = { readonly entries: readonly { readonly idx: number; readonly tag: string }[] };

const directory = "drizzle";
const namePattern = /^\d{14}_[a-z0-9_]+\.sql$/u;
const rollbackMarker = /^-- rollback:$/mu;

function git(args: readonly string[]): string | null {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

function linesOf(output: string | null): string[] {
  return (output ?? "").split("\n").filter((line) => line !== "");
}

function fileProblems(files: readonly string[]): string[] {
  return files.flatMap((file) => [
    ...(namePattern.test(file) ? [] : [`${file}: name must be <UTC yyyymmddhhmmss>_<snake_case>.sql`]),
    ...(rollbackMarker.test(readFileSync(`${directory}/${file}`, "utf8")) ? [] : [`${file}: no "-- rollback:" block`]),
  ]);
}

function journalTags(text: string): string[] {
  return (JSON.parse(text) as Journal).entries.map((entry) => entry.tag);
}

function journalProblems(files: readonly string[]): string[] {
  const journal = JSON.parse(readFileSync(`${directory}/meta/_journal.json`, "utf8")) as Journal;
  const listed = journal.entries.map((entry) => `${entry.tag}.sql`).join("\n");
  const problems = listed === [...files].sort().join("\n") ? [] : ["drizzle/meta/_journal.json must list exactly the migration files, in timestamp order"];
  return journal.entries.every((entry, index) => entry.idx === index) ? problems : [...problems, "journal idx values are not sequential"];
}

function immutabilityProblems(base: string): string[] {
  const changed = linesOf(git(["diff", "--name-status", "--no-renames", base, "--", `${directory}/*.sql`]));
  const problems = changed.filter((line) => !line.startsWith("A")).map((line) => `${line.slice(1).trim()}: applied migrations are immutable`);
  const baseJournal = git(["show", `${base}:${directory}/meta/_journal.json`]);
  if (baseJournal === null) return problems;
  const current = journalTags(readFileSync(`${directory}/meta/_journal.json`, "utf8"));
  const appendOnly = journalTags(baseJournal).every((tag, index) => current[index] === tag);
  return appendOnly ? problems : [...problems, "journal entries already on the base were changed or reordered"];
}

function perCommitProblems(base: string): string[] {
  return linesOf(git(["rev-list", `${base}..HEAD`])).flatMap((commit) => {
    const added = linesOf(git(["diff-tree", "--root", "--no-commit-id", "--name-only", "--diff-filter=A", "-r", commit, "--", `${directory}/*.sql`]));
    return added.length > 1 ? [`commit ${commit.slice(0, 12)} adds ${added.length} migrations; add one per commit`] : [];
  });
}

function resolveBase(): string | null {
  const requested = process.env["MIGRATIONS_BASE_REF"] ?? "origin/main";
  return /^0*$/u.test(requested) ? null : git(["rev-parse", "--verify", "--quiet", `${requested}^{commit}`]);
}

const files = readdirSync(directory).filter((file) => file.endsWith(".sql"));
const base = resolveBase();
const problems = [...fileProblems(files), ...journalProblems(files), ...(base === null ? [] : [...immutabilityProblems(base), ...perCommitProblems(base)])];
if (base === null) console.warn("No base revision: immutability and one-per-commit checks skipped.");
for (const problem of problems) console.error(`migrations ${problem}`);
console.log(problems.length === 0 ? `Migrations check passed (${files.length} migrations).` : `${problems.length} migration problems.`);
process.exitCode = problems.length === 0 ? 0 : 1;
