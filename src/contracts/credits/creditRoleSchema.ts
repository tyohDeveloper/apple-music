// What a credited performer did, from data/taxonomies/credit-roles.json (ADR-0009).
import Type from "typebox";
import creditRoles from "../../../data/taxonomies/credit-roles.json" with { type: "json" };

export const creditRoleSchema = Type.String({ enum: creditRoles.entries.map((entry) => entry.id) });
