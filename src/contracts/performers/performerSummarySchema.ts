// One row of a performer search: the performer under its preferred name.
import Type from "typebox";

export const performerSummarySchema = Type.Object(
  {
    id: Type.String(),
    kind: Type.String(),
    name: Type.String(),
    sortName: Type.String(),
    disambiguation: Type.Union([Type.String(), Type.Null()]),
  },
  { additionalProperties: false },
);

export type PerformerSummary = Type.Static<typeof performerSummarySchema>;
