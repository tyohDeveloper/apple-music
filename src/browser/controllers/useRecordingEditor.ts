// Loads one recording and applies edits to its details, credits and genres. Every change
// answers with the recording as it now stands; saved credits become the clean draft.
import type { RecordingDetail } from "../../contracts/recordings/recordingDetailSchema.ts";
import { updateRecordingRequestOf } from "../../forms/updateRecordingRequestOf.ts";
import type { Route } from "../../routing/parseRoute.ts";
import * as remote from "../server-api/recordingRequests.ts";
import { replaceCreditsRequestOf } from "../state/credits/creditDraftReducer.ts";
import { externalIdAssignmentOf, type ExternalIdAssignmentControls } from "./externalIdAssignmentOf.ts";
import { genreAssignmentOf, type GenreAssignmentControls } from "./genreAssignmentOf.ts";
import { useCatalogEditor, type CatalogEditorControls, type CatalogEditorRequests } from "./useCatalogEditor.ts";
import { useCreditDraft, type CreditDraftControls } from "./useCreditDraft.ts";
import type { FormValues } from "./formValuesOf.ts";

const recordingEditorRequests: CatalogEditorRequests<RecordingDetail> = { fetch: remote.fetchRecording, remove: remote.deleteRecording };

export type RecordingEditorControls = CatalogEditorControls<RecordingDetail> & {
  readonly save: (values: FormValues) => void;
  readonly credits: CreditDraftControls;
  readonly saveCredits: () => void;
  readonly genres: GenreAssignmentControls;
  readonly externalIds: ExternalIdAssignmentControls;
};

export function useRecordingEditor(libraryId: string, recordingId: string, navigate: (route: Route) => void): RecordingEditorControls {
  const editor = useCatalogEditor(libraryId, recordingId, recordingEditorRequests, () => navigate({ name: "recordings", libraryId }));
  const credits = useCreditDraft(libraryId, editor.state.entity?.credits ?? null);
  const save = (values: FormValues): void => {
    const body = updateRecordingRequestOf(values);
    if (body === null) editor.refuse("validation");
    else editor.apply(remote.patchRecording(libraryId, recordingId, body));
  };
  const saveCredits = (): void => {
    editor.apply(remote.putRecordingCredits(libraryId, recordingId, replaceCreditsRequestOf(credits.state)), (saved) => credits.reset(saved.credits));
  };
  const genres = genreAssignmentOf(editor.state.entity?.genres, (genreIds) => editor.apply(remote.putRecordingGenres(libraryId, recordingId, { genreIds })));
  const externalIds = externalIdAssignmentOf(editor.state.entity?.externalIds, (ids) => editor.apply(remote.putRecordingExternalIds(libraryId, recordingId, { externalIds: ids })));
  return { ...editor, save, credits, saveCredits, genres, externalIds };
}
