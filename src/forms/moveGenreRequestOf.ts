// The move a submitted placement form describes: under the chosen genre, or to the top
// level when the choice is blank.
import type { UpdateGenreRequest } from "../contracts/genres/updateGenreRequestSchema.ts";

export function moveGenreRequestOf(values: Readonly<Record<string, string>>): UpdateGenreRequest {
  const parentId = values["parentId"] ?? "";
  return { parentId: parentId === "" ? null : parentId };
}
