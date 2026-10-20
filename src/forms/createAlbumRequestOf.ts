// The create-album request a submitted form describes; blank optional fields are left out.
import type { CreateAlbumRequest } from "../contracts/albums/createAlbumRequestSchema.ts";
import { optionalField } from "./optionalField.ts";

export function createAlbumRequestOf(values: Readonly<Record<string, string>>): CreateAlbumRequest {
  const released = optionalField(values, "released");
  return {
    title: values["title"] ?? "",
    kind: values["kind"] ?? "",
    ...(released === undefined ? {} : { released }),
  };
}
