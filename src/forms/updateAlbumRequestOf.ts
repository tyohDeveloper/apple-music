// The update-album request a submitted details form describes: every field is sent, and a
// blank field clears the stored value.
import type { UpdateAlbumRequest } from "../contracts/albums/updateAlbumRequestSchema.ts";
import { nullableField } from "./nullableField.ts";

export function updateAlbumRequestOf(values: Readonly<Record<string, string>>): UpdateAlbumRequest {
  return {
    title: values["title"] ?? "",
    kind: values["kind"] ?? "",
    released: nullableField(values, "released"),
    label: nullableField(values, "label"),
    notes: nullableField(values, "notes"),
  };
}
