// What kind of release the album is, from data/taxonomies/album-kinds.json (ADR-0009).
import Type from "typebox";
import albumKinds from "../../../data/taxonomies/album-kinds.json" with { type: "json" };

export const albumKindSchema = Type.String({ enum: albumKinds.entries.map((entry) => entry.id) });
