import Type from "typebox";
import { recordingSummarySchema } from "./recordingSummarySchema.ts";

export const recordingPageSchema = Type.Object(
  { items: Type.Array(recordingSummarySchema), total: Type.Integer({ minimum: 0 }) },
  { additionalProperties: false },
);
