// One credit as read: the performer under its preferred name, the name it was credited as
// (null for the preferred name), and every name of that performer to choose from.
import Type from "typebox";
import { performerReferenceSchema } from "../performers/performerReferenceSchema.ts";

const nameReferenceSchema = Type.Object({ id: Type.String(), name: Type.String() }, { additionalProperties: false });

export const creditSchema = Type.Object(
  {
    performer: performerReferenceSchema,
    creditedName: Type.Union([nameReferenceSchema, Type.Null()]),
    role: Type.String(),
    joinPhrase: Type.Union([Type.String(), Type.Null()]),
    instruments: Type.Array(Type.String()),
    performerNames: Type.Array(nameReferenceSchema),
  },
  { additionalProperties: false },
);

export type Credit = Type.Static<typeof creditSchema>;
