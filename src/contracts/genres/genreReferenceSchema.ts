// A genre named on an album, recording or performer, or on another genre: its id and name.
import Type from "typebox";

export const genreReferenceSchema = Type.Object({ id: Type.String(), name: Type.String() }, { additionalProperties: false });
