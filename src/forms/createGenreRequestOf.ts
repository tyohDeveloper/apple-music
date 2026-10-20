// The create-genre request a submitted form describes, under a parent when one is given;
// blank notes are left out.
import type { CreateGenreRequest } from "../contracts/genres/createGenreRequestSchema.ts";
import { optionalField } from "./optionalField.ts";

export function createGenreRequestOf(values: Readonly<Record<string, string>>, parentId?: string): CreateGenreRequest {
  const notes = optionalField(values, "notes");
  return {
    name: values["name"] ?? "",
    ...(parentId === undefined ? {} : { parentId }),
    ...(notes === undefined ? {} : { notes }),
  };
}
