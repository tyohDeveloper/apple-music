import Type from "typebox";
import { genreSummarySchema } from "./genreSummarySchema.ts";

export const genrePageSchema = Type.Object(
  { items: Type.Array(genreSummarySchema), total: Type.Integer({ minimum: 0 }) },
  { additionalProperties: false },
);
