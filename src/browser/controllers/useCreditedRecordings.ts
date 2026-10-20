// The recordings that credit one performer, a page at a time, for the performer's page.
import { useCallback, useEffect, useReducer } from "preact/hooks";
import type { RecordingSummary } from "../../contracts/recordings/recordingSummarySchema.ts";
import { catalogPageSize } from "../server-api/catalogPageRequest.ts";
import { fetchCreditedRecordingPage } from "../server-api/recordingRequests.ts";
import { catalogListFailed, catalogListLoaded, catalogListRequested } from "../state/catalog/catalogListActions.ts";
import { catalogListReducer, initialCatalogListState, type CatalogListState } from "../state/catalog/catalogListReducer.ts";

export type CreditedRecordingsControls = {
  readonly state: CatalogListState<RecordingSummary>;
  readonly showPrevious: () => void;
  readonly showNext: () => void;
};

export function useCreditedRecordings(libraryId: string, performerId: string): CreditedRecordingsControls {
  const [state, dispatch] = useReducer(catalogListReducer<RecordingSummary>, initialCatalogListState);
  const load = useCallback((offset: number) => {
    dispatch(catalogListRequested("", offset));
    void fetchCreditedRecordingPage(libraryId, performerId, offset).then((result) => dispatch(result.ok ? catalogListLoaded(result.value) : catalogListFailed(result.code)));
  }, [libraryId, performerId]);
  useEffect(() => load(0), [load]);
  return { state, showPrevious: () => load(Math.max(0, state.offset - catalogPageSize)), showNext: () => load(state.offset + catalogPageSize) };
}
