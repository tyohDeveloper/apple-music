// How an edition track relates to the intended album, from data/taxonomies/track-inclusions.json.
import Type from "typebox";
import trackInclusions from "../../../data/taxonomies/track-inclusions.json" with { type: "json" };

export const trackInclusionSchema = Type.String({ enum: trackInclusions.entries.map((entry) => entry.id) });
