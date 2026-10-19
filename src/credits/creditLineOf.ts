// The credit line of a recording or album: its performing credits in order, each under the
// name it was credited as, joined by their join phrases (DOMAIN-MODEL.md, Credits). Writer
// and production credits are not part of the line. A credit without a join phrase is
// followed by a comma; the last credit's join phrase is dropped.
import creditRoles from "../../data/taxonomies/credit-roles.json" with { type: "json" };

export type CreditLinePart = { readonly name: string; readonly role: string; readonly joinPhrase: string | null };

const performingRoles = new Set(creditRoles.entries.filter((entry) => entry.family === "performer").map((entry) => entry.id));
const defaultJoinPhrase = ", ";

export function creditLineOf(credits: readonly CreditLinePart[]): string {
  const shown = credits.filter((credit) => performingRoles.has(credit.role));
  return shown.map((credit, index) => (index === shown.length - 1 ? credit.name : credit.name + (credit.joinPhrase ?? defaultJoinPhrase))).join("");
}
