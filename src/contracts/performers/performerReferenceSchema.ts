// Another performer named in a relation or credit: its id and preferred name.
import Type from "typebox";

export const performerReferenceSchema = Type.Object({ id: Type.String(), name: Type.String() }, { additionalProperties: false });
