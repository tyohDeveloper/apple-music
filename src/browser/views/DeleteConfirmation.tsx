// A delete button that asks for confirmation before anything is deleted.
import type { CatalogEditorControls } from "../controllers/useCatalogEditor.ts";

type DeleteLabels = { readonly request: string; readonly confirm: string; readonly cancel: string };
type DeleteControls = Pick<CatalogEditorControls<unknown>, "requestDelete" | "cancelDelete" | "confirmDelete"> & {
  readonly state: { readonly confirmingDelete: boolean; readonly saving: boolean };
};

type DeleteConfirmationProps = { readonly labels: DeleteLabels; readonly controls: DeleteControls };

export function DeleteConfirmation({ labels, controls }: DeleteConfirmationProps) {
  if (!controls.state.confirmingDelete) {
    return (
      <button type="button" class="danger" data-testid="button-delete-request" onClick={controls.requestDelete}>
        {labels.request}
      </button>
    );
  }
  return (
    <span class="confirm">
      <button type="button" class="danger" disabled={controls.state.saving} data-testid="button-delete-confirm" onClick={controls.confirmDelete}>
        {labels.confirm}
      </button>
      <button type="button" class="secondary" data-testid="button-delete-cancel" onClick={controls.cancelDelete}>
        {labels.cancel}
      </button>
    </span>
  );
}
