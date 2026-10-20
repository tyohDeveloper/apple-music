// What kind of edition this is, from data/taxonomies/edition-kinds.json (ADR-0009).
import Type from "typebox";
import editionKinds from "../../../data/taxonomies/edition-kinds.json" with { type: "json" };

export const editionKindSchema = Type.String({ enum: editionKinds.entries.map((entry) => entry.id) });
