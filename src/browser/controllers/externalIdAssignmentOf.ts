// Edits of the external identifiers of a performer, album, edition or recording, each
// saved at once as the whole list (PUT .../external-ids). A value without its namespace's
// form is refused before sending, by the rules the server applies again on receipt.
import type { ExternalId } from "../../contracts/identifiers/externalIdSchema.ts";
import type { ExternalIdOwner } from "../../identifiers/externalIdFormatOf.ts";
import { normalizedExternalIdOf } from "../../identifiers/normalizedExternalIdOf.ts";
import type { FormValues } from "./formValuesOf.ts";

type ExternalIdAddition = { readonly onAdded: () => void; readonly onRefused: (failure: string) => void };

export type ExternalIdAssignmentControls = {
  readonly add: (values: FormValues, addition: ExternalIdAddition) => void;
  readonly remove: (index: number) => void;
};

type Setter = (externalIds: ExternalId[], onSaved?: () => void) => void;

export function externalIdAssignmentOf(owner: ExternalIdOwner, externalIds: readonly ExternalId[] | undefined, setExternalIds: Setter): ExternalIdAssignmentControls {
  const current = externalIds ?? [];
  return {
    add: (values, { onAdded, onRefused }) => {
      const namespace = values["namespace"] ?? "";
      const value = normalizedExternalIdOf(owner, namespace, values["value"] ?? "");
      if (value === null) onRefused("invalid-external-id");
      else setExternalIds([...current, { namespace, value }], onAdded);
    },
    remove: (index) => setExternalIds(current.filter((_, position) => position !== index)),
  };
}
