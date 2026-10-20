// Another name for a genre, such as an Apple Music genre name.
import Type from "typebox";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";

export const createGenreAliasRequestSchema = Type.Object({ name: shortTextSchema }, { additionalProperties: false });

export type CreateGenreAliasRequest = Type.Static<typeof createGenreAliasRequestSchema>;
