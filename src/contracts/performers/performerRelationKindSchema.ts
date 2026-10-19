// Performer relation kinds, from data/taxonomies/performer-relation-kinds.json (ADR-0009).
import Type from "typebox";
import performerRelationKinds from "../../../data/taxonomies/performer-relation-kinds.json" with { type: "json" };

export const performerRelationKindSchema = Type.String({ enum: performerRelationKinds.entries.map((entry) => entry.id) });
