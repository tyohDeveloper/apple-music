// One credit of a recording or album in a library export, in stored order: the performer and
// the name it was credited as (null for the preferred name), by id.
import Type from "typebox";
import { creditRoleSchema } from "../credits/creditRoleSchema.ts";
import { exportIdSchema } from "./exportIdSchema.ts";

export const exportCreditSchema = Type.Object(
  {
    performerId: exportIdSchema,
    creditedNameId: Type.Union([exportIdSchema, Type.Null()]),
    role: creditRoleSchema,
    joinPhrase: Type.Union([Type.String(), Type.Null()]),
    instruments: Type.Array(Type.String()),
  },
  { additionalProperties: false },
);
