// Performer name kinds, from data/taxonomies/performer-name-kinds.json (ADR-0009).
import Type from "typebox";
import performerNameKinds from "../../../data/taxonomies/performer-name-kinds.json" with { type: "json" };

export const performerNameKindSchema = Type.String({ enum: performerNameKinds.entries.map((entry) => entry.id) });
