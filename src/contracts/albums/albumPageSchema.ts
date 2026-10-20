import Type from "typebox";
import { albumSummarySchema } from "./albumSummarySchema.ts";

export const albumPageSchema = Type.Object(
  { items: Type.Array(albumSummarySchema), total: Type.Integer({ minimum: 0 }) },
  { additionalProperties: false },
);
