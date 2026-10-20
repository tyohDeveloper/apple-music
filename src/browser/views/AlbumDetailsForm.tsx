import albumKinds from "../../../data/taxonomies/album-kinds.json" with { type: "json" };
import type { AlbumDetail } from "../../contracts/albums/albumDetailSchema.ts";
import type { AlbumEditorControls } from "../controllers/useAlbumEditor.ts";
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { DeleteConfirmation } from "./DeleteConfirmation.tsx";
import { TaxonomyOptions } from "./TaxonomyOptions.tsx";

type AlbumDetailsFormProps = { readonly messages: Messages; readonly album: AlbumDetail; readonly controls: AlbumEditorControls };

export function AlbumDetailsForm({ messages, album, controls }: AlbumDetailsFormProps) {
  const { t } = messages;
  return (
    <form key={album.id} class="panel stack" data-testid="panel-album-details" onSubmit={(event) => controls.save(formValuesOf(event))}>
      <h2>{t("album.details")}</h2>
      <label class="field">
        <span>{t("album.title")}</span>
        <input name="title" required maxLength={300} defaultValue={album.title} data-testid="input-album-title" />
      </label>
      <div class="field-row">
        <label class="field">
          <span>{t("album.kind")}</span>
          <select name="kind" data-testid="select-album-kind">
            <TaxonomyOptions messages={messages} taxonomy={albumKinds} selected={album.kind} />
          </select>
        </label>
        <label class="field">
          <span>{t("album.released")}</span>
          <input name="released" maxLength={10} defaultValue={album.released ?? ""} data-testid="input-album-released" />
        </label>
      </div>
      <label class="field">
        <span>{t("album.label")}</span>
        <input name="label" maxLength={300} defaultValue={album.label ?? ""} data-testid="input-album-label" />
      </label>
      <label class="field">
        <span>{t("album.notes")}</span>
        <textarea name="notes" rows={4} maxLength={10000} defaultValue={album.notes ?? ""} data-testid="input-album-notes" />
      </label>
      <div class="actions">
        <button type="submit" disabled={controls.state.saving} data-testid="button-album-save">{t("album.save")}</button>
        <DeleteConfirmation labels={{ request: t("album.delete"), confirm: t("album.delete.confirm"), cancel: t("album.delete.cancel") }} controls={controls} />
      </div>
    </form>
  );
}
