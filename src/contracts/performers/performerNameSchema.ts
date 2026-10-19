import Type from "typebox";

const nullableText = Type.Union([Type.String(), Type.Null()]);

export const performerNameSchema = Type.Object(
  {
    id: Type.String(),
    name: Type.String(),
    sortName: Type.String(),
    kind: Type.String(),
    locale: nullableText,
    validFrom: nullableText,
    validTo: nullableText,
    isPreferred: Type.Boolean(),
  },
  { additionalProperties: false },
);

export type PerformerName = Type.Static<typeof performerNameSchema>;
