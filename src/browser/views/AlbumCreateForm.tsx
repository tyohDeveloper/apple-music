import albumKinds from "../../../data/taxonomies/album-kinds.json" with { type: "json" };
import { formValuesOf, type FormValues } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { TaxonomyOptions } from "./TaxonomyOptions.tsx";

type AlbumCreateFormProps = {
  readonly messages: Messages;
  readonly creating: boolean;
  readonly failure: string | null;
  readonly onCreate: (values: FormValues) => void;
};

export function AlbumCreateForm({ messages, creating, failure, onCreate }: AlbumCreateFormProps) {
  const { t } = messages;
  return (
    <form class="panel stack" data-testid="panel-albums-create" onSubmit={(event) => onCreate(formValuesOf(event))}>
      <h2>{t("albums.create.heading")}</h2>
      <label class="field">
        <span>{t("albums.create.title")}</span>
        <input name="title" required maxLength={300} data-testid="input-albums-title" />
      </label>
      <div class="field-row">
        <label class="field">
          <span>{t("albums.create.kind")}</span>
          <select name="kind" required data-testid="select-albums-kind">
            <TaxonomyOptions messages={messages} taxonomy={albumKinds} />
          </select>
        </label>
        <label class="field">
          <span>{t("albums.create.released")}</span>
          <input name="released" maxLength={10} data-testid="input-albums-released" />
        </label>
      </div>
      {failure !== null && <p role="alert" class="error" data-testid="display-albums-create-error">{messages.errorMessage(failure)}</p>}
      <button type="submit" disabled={creating} data-testid="button-albums-create">{t("albums.create.submit")}</button>
    </form>
  );
}
