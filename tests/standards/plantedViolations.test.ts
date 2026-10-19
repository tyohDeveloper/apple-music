// Each standards rule reports a violation planted for it, citing the expected section.
import { describe, expect, it } from "vitest";
import { checkAmbient } from "../../scripts/standards/rules/checkAmbient.ts";
import { checkData } from "../../scripts/standards/rules/checkData.ts";
import { checkExports } from "../../scripts/standards/rules/checkExports.ts";
import { checkGovernance } from "../../scripts/standards/rules/checkGovernance.ts";
import { checkImports } from "../../scripts/standards/rules/checkImports.ts";
import { checkLocales } from "../../scripts/standards/rules/checkLocales.ts";
import { checkNames } from "../../scripts/standards/rules/checkNames.ts";
import { checkRoleCoverage } from "../../scripts/standards/rules/checkRoleCoverage.ts";
import { checkSizes } from "../../scripts/standards/rules/checkSizes.ts";
import { checkTests } from "../../scripts/standards/rules/checkTests.ts";
import { checkViews } from "../../scripts/standards/rules/checkViews.ts";
import type { Repository } from "../../scripts/standards/repository.ts";
import type { Violation } from "../../scripts/standards/violation.ts";
import { overlayRepository } from "./support/overlayRepository.ts";

type Rule = (repository: Repository) => Violation[];
type PlantedCase = { readonly name: string; readonly rule: Rule; readonly section: string; readonly file: string; readonly text: string };

const today = "2026-10-19";
const longBody = Array.from({ length: 21 }, (_, index) => `  const value${index} = ${index};`).join("\n");
const expiredException = { schemaVersion: 1, exceptions: [{ id: "EXC-9999", section: "§3.1", owner: "@tyohDeveloper", expires: "2026-01-01" }] };

const cases: readonly PlantedCase[] = [
  { name: "unmapped file", rule: checkRoleCoverage, section: "§0", file: "src/unmapped/plantedFile.ts", text: "export const plantedFile = 1;\n" },
  { name: "upward import", rule: checkImports, section: "§1", file: "src/names/plantedUpward.ts", text: 'import { readServerConfig } from "../server/config/readServerConfig.ts";\nexport function plantedUpward() { return readServerConfig; }\n' },
  { name: "restricted package", rule: checkImports, section: "§1", file: "src/routing/plantedPackage.ts", text: 'import pg from "pg";\nexport function plantedPackage() { return pg; }\n' },
  { name: "ambient clock", rule: checkAmbient, section: "§1.4", file: "src/routing/plantedClock.ts", text: "export function plantedClock() { return Date.now(); }\n" },
  { name: "module state", rule: checkAmbient, section: "§1.4", file: "src/routing/plantedState.ts", text: "let count = 0;\nexport function plantedState() { count += 1; return count; }\n" },
  { name: "long function", rule: checkSizes, section: "§3.1", file: "src/routing/plantedLong.ts", text: `export function plantedLong() {\n${longBody}\n  return 0;\n}\n` },
  { name: "two exports", rule: checkExports, section: "§3.2", file: "src/routing/plantedPair.ts", text: "export function plantedPair() { return 1; }\nexport function another() { return 2; }\n" },
  { name: "re-export", rule: checkExports, section: "§3.9", file: "src/routing/plantedBarrel.ts", text: 'export { parseRoute } from "./parseRoute.ts";\n' },
  { name: "shape name", rule: checkNames, section: "§3.8", file: "src/routing/utils.ts", text: "export function utils() { return 1; }\n" },
  { name: "missing test id", rule: checkViews, section: "§4.1", file: "src/browser/views/PlantedButton.tsx", text: 'export function PlantedButton(props: { onSave: () => void }) {\n  return <button type="button" onClick={props.onSave} />;\n}\n' },
  { name: "malformed test id", rule: checkViews, section: "§4.2", file: "src/browser/views/PlantedTestId.tsx", text: 'export function PlantedTestId() {\n  return <div data-testid="Planted_Id" />;\n}\n' },
  { name: "visible literal", rule: checkViews, section: "§5.6", file: "src/browser/views/PlantedLiteral.tsx", text: "export function PlantedLiteral() {\n  return <p>Save changes</p>;\n}\n" },
  { name: "unknown message key", rule: checkLocales, section: "§15.1", file: "src/browser/controllers/plantedKey.ts", text: 'export function plantedKey(t: (key: string) => string) { return t("planted.missing"); }\n' },
  { name: "invalid data file", rule: checkData, section: "§5.2", file: "data/taxonomies/planted.json", text: '{ "taxonomy": 3 }\n' },
  { name: "untested pure function", rule: checkTests, section: "§8.1", file: "src/routing/plantedUntested.ts", text: "export function plantedUntested() { return 1; }\n" },
  { name: "expired exception", rule: checkGovernance, section: "§11", file: ".architecture-exceptions.json", text: JSON.stringify(expiredException) },
];

describe("standards checker", () => {
  it("finds nothing in the repository as committed", () => {
    const repository = overlayRepository({}, today);
    const rules = [checkRoleCoverage, checkImports, checkAmbient, checkSizes, checkExports, checkNames, checkViews, checkLocales, checkData, checkTests, checkGovernance];
    expect(rules.flatMap((rule) => rule(repository))).toEqual([]);
  });

  it.each(cases)("reports a planted $name under $section", ({ rule, section, file, text }) => {
    const found = rule(overlayRepository({ [file]: text }, today));
    expect(found).toContainEqual(expect.objectContaining({ section, file }));
  });
});
