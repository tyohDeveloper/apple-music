// Changes to one name; null clears an optional field. isPreferred can only be set to true:
// a performer stops preferring a name by preferring another.
import Type from "typebox";
import { localeTagSchema } from "../catalog/localeTagSchema.ts";
import { partialDateSchema } from "../catalog/partialDateSchema.ts";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";
import { performerNameKindSchema } from "./performerNameKindSchema.ts";

export const updatePerformerNameRequestSchema = Type.Object(
  {
    name: Type.Optional(shortTextSchema),
    sortName: Type.Optional(shortTextSchema),
    kind: Type.Optional(performerNameKindSchema),
    locale: Type.Optional(Type.Union([localeTagSchema, Type.Null()])),
    validFrom: Type.Optional(Type.Union([partialDateSchema, Type.Null()])),
    validTo: Type.Optional(Type.Union([partialDateSchema, Type.Null()])),
    isPreferred: Type.Optional(Type.Literal(true)),
  },
  { additionalProperties: false, minProperties: 1 },
);

export type UpdatePerformerNameRequest = Type.Static<typeof updatePerformerNameRequestSchema>;
