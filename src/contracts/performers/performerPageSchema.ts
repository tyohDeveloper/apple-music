import Type from "typebox";
import { performerSummarySchema } from "./performerSummarySchema.ts";

export const performerPageSchema = Type.Object(
  { items: Type.Array(performerSummarySchema), total: Type.Integer({ minimum: 0 }) },
  { additionalProperties: false },
);

export type PerformerPage = Type.Static<typeof performerPageSchema>;
