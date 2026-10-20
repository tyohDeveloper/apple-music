// The whole list of a performer's, album's, edition's or recording's external identifiers.
import Type from "typebox";
import { externalIdSchema } from "./externalIdSchema.ts";

export const replaceExternalIdsRequestSchema = Type.Object({ externalIds: Type.Array(externalIdSchema, { maxItems: 50 }) }, { additionalProperties: false });

export type ReplaceExternalIdsRequest = Type.Static<typeof replaceExternalIdsRequestSchema>;
