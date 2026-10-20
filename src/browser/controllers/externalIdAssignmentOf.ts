// Edits of the external identifiers of a performer, album, edition or recording, each
// saved at once as the whole list (PUT .../external-ids). The server normalizes and checks
// each value; a refused one leaves the list as it was and shows why.
import type { ExternalId } from "../../contracts/identifiers/externalIdSchema.ts";
import type { FormValues } from "./formValuesOf.ts";

export type ExternalIdAssignmentControls = {
  readonly add: (values: FormValues) => void;
  readonly remove: (index: number) => void;
};

export function externalIdAssignmentOf(externalIds: readonly ExternalId[] | undefined, setExternalIds: (externalIds: ExternalId[]) => void): ExternalIdAssignmentControls {
  const current = externalIds ?? [];
  return {
    add: (values) => {
      const [namespace, value] = [values["namespace"] ?? "", (values["value"] ?? "").trim()];
      if (namespace !== "" && value !== "") setExternalIds([...current, { namespace, value }]);
    },
    remove: (index) => setExternalIds(current.filter((_, position) => position !== index)),
  };
}
