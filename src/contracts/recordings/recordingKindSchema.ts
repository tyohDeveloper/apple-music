// What kind of recording this is, from data/taxonomies/recording-kinds.json (ADR-0009).
import Type from "typebox";
import recordingKinds from "../../../data/taxonomies/recording-kinds.json" with { type: "json" };

export const recordingKindSchema = Type.String({ enum: recordingKinds.entries.map((entry) => entry.id) });
