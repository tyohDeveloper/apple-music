// The credit list being edited beside a recording (or album) editor. It follows the stored
// list until the user changes it, and again once the change is saved or discarded. A newly
// added performer's names are fetched so it can be credited under any of them.
import { useEffect, useReducer } from "preact/hooks";
import type { Credit } from "../../contracts/credits/creditSchema.ts";
import type { FormValues } from "./formValuesOf.ts";
import { fetchPerformer } from "../server-api/performerRequests.ts";
import * as actions from "../state/credits/creditDraftActions.ts";
import { creditDraftReducer, initialCreditDraftState, type CreditDraftState } from "../state/credits/creditDraftReducer.ts";

type PerformerReference = { readonly id: string; readonly name: string };

export type CreditDraftControls = {
  readonly state: CreditDraftState;
  readonly add: (values: FormValues, choices: readonly PerformerReference[]) => void;
  readonly remove: (index: number) => void;
  readonly move: (index: number, offset: -1 | 1) => void;
  readonly change: (index: number, change: actions.CreditChange) => void;
  readonly reset: (credits: readonly Credit[]) => void;
};

type Dispatch = (action: actions.CreditDraftAction) => void;

function adder(libraryId: string, dispatch: Dispatch) {
  return (values: FormValues, choices: readonly PerformerReference[]): void => {
    const performer = choices.find((choice) => choice.id === values["performerId"]);
    if (performer === undefined) return;
    const role = values["role"] ?? "primary";
    dispatch(actions.creditAdded({ performer: { id: performer.id, name: performer.name }, creditedName: null, role, joinPhrase: null, instruments: [], performerNames: [] }));
    void fetchPerformer(libraryId, performer.id).then((result) => {
      if (result.ok) dispatch(actions.creditNamesLoaded(performer.id, result.value.names.map(({ id, name }) => ({ id, name }))));
    });
  };
}

export function useCreditDraft(libraryId: string, stored: readonly Credit[] | null): CreditDraftControls {
  const [state, dispatch] = useReducer(creditDraftReducer, initialCreditDraftState);
  useEffect(() => {
    if (stored !== null && !state.dirty) dispatch(actions.creditsReset(stored));
  }, [stored, state.dirty]);
  return {
    state,
    add: adder(libraryId, dispatch),
    remove: (index) => dispatch(actions.creditRemoved(index)),
    move: (index, offset) => dispatch(actions.creditMoved(index, offset)),
    change: (index, change) => dispatch(actions.creditChanged(index, change)),
    reset: (credits) => dispatch(actions.creditsReset(credits)),
  };
}
