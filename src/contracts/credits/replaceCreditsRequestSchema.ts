// The whole ordered credit list of a recording or album, replacing the stored one
// (ADR-0009). A join phrase is kept exactly as typed, spaces included.
import Type from "typebox";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";
import { creditRoleSchema } from "./creditRoleSchema.ts";

const creditRequestSchema = Type.Object(
  {
    performerId: Type.String({ format: "uuid" }),
    creditedNameId: Type.Optional(Type.Union([Type.String({ format: "uuid" }), Type.Null()])),
    role: creditRoleSchema,
    joinPhrase: Type.Optional(Type.Union([Type.String({ minLength: 1, maxLength: 50 }), Type.Null()])),
    instruments: Type.Optional(Type.Array(shortTextSchema, { maxItems: 20 })),
  },
  { additionalProperties: false },
);

export const replaceCreditsRequestSchema = Type.Object({ credits: Type.Array(creditRequestSchema, { maxItems: 200 }) }, { additionalProperties: false });

export type ReplaceCreditsRequest = Type.Static<typeof replaceCreditsRequestSchema>;
