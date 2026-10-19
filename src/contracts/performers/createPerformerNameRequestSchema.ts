// Another name for a performer; isPreferred makes it the display name.
import Type from "typebox";
import { localeTagSchema } from "../catalog/localeTagSchema.ts";
import { partialDateSchema } from "../catalog/partialDateSchema.ts";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";
import { performerNameKindSchema } from "./performerNameKindSchema.ts";

export const createPerformerNameRequestSchema = Type.Object(
  {
    name: shortTextSchema,
    sortName: Type.Optional(shortTextSchema),
    kind: performerNameKindSchema,
    locale: Type.Optional(localeTagSchema),
    validFrom: Type.Optional(partialDateSchema),
    validTo: Type.Optional(partialDateSchema),
    isPreferred: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
);

export type CreatePerformerNameRequest = Type.Static<typeof createPerformerNameRequestSchema>;
