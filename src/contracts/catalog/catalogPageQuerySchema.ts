// Query string of every catalog list: a search text and a 0-indexed page window (§6).
// Defaults: no search text, offset 0, limit 50.
import Type from "typebox";

export const catalogPageQuerySchema = Type.Object(
  {
    query: Type.Optional(Type.String({ maxLength: 200 })),
    offset: Type.Optional(Type.Integer({ minimum: 0, maximum: 1000000 })),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
  },
  { additionalProperties: false },
);

export type CatalogPageQuery = Type.Static<typeof catalogPageQuerySchema>;
