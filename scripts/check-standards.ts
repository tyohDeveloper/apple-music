// Standards check (BUILD). Each failure cites the section of docs/standards/portable-v2.2.md
// it enforces (§7.8); the mapping to commands is docs/CODING-STANDARDS.md, Enforcement matrix.
import { openRepository } from "./standards/repository.ts";
import { checkAmbient } from "./standards/rules/checkAmbient.ts";
import { checkData } from "./standards/rules/checkData.ts";
import { checkExports } from "./standards/rules/checkExports.ts";
import { checkGovernance } from "./standards/rules/checkGovernance.ts";
import { checkImports } from "./standards/rules/checkImports.ts";
import { checkLocales } from "./standards/rules/checkLocales.ts";
import { checkNames } from "./standards/rules/checkNames.ts";
import { checkRoleCoverage } from "./standards/rules/checkRoleCoverage.ts";
import { checkSizes } from "./standards/rules/checkSizes.ts";
import { checkTests } from "./standards/rules/checkTests.ts";
import { checkViews } from "./standards/rules/checkViews.ts";
import type { Violation } from "./standards/violation.ts";

const rules = [checkRoleCoverage, checkImports, checkAmbient, checkSizes, checkExports, checkNames, checkViews, checkLocales, checkData, checkTests, checkGovernance];

function describe(found: Violation): string {
  return `${found.section.padEnd(8)} ${found.file}${found.line === undefined ? "" : `:${found.line}`}  ${found.message}`;
}

const repository = openRepository(new Date().toISOString().slice(0, 10));
const violations = rules.flatMap((rule) => rule(repository));
for (const found of violations) console.error(describe(found));
console.log(violations.length === 0 ? `Standards check passed (${repository.files.length} files).` : `${violations.length} standards violations.`);
process.exitCode = violations.length === 0 ? 0 : 1;
