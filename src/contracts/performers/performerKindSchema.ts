// Performer kinds, from data/taxonomies/performer-kinds.json (ADR-0009).
import Type from "typebox";
import performerKinds from "../../../data/taxonomies/performer-kinds.json" with { type: "json" };

export const performerKindSchema = Type.String({ enum: performerKinds.entries.map((entry) => entry.id) });
