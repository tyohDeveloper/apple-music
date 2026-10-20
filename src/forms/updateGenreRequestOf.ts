// The update-genre request a submitted details form describes: the name, and notes that a
// blank field clears.
import type { UpdateGenreRequest } from "../contracts/genres/updateGenreRequestSchema.ts";
import { nullableField } from "./nullableField.ts";

export function updateGenreRequestOf(values: Readonly<Record<string, string>>): UpdateGenreRequest {
  return { name: values["name"] ?? "", notes: nullableField(values, "notes") };
}
