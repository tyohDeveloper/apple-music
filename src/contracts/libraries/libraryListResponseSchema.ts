import Type from "typebox";
import { librarySummarySchema } from "./librarySummarySchema.ts";

export const libraryListResponseSchema = Type.Object(
  { libraries: Type.Array(librarySummarySchema) },
  { additionalProperties: false },
);

export type LibraryListResponse = Type.Static<typeof libraryListResponseSchema>;
