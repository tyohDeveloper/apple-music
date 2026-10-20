// The credit list as being edited, whether it differs from the stored list, and the
// request that would store it.
import type { Credit } from "../../../contracts/credits/creditSchema.ts";
import type { ReplaceCreditsRequest } from "../../../contracts/credits/replaceCreditsRequestSchema.ts";
import type { CreditDraftAction } from "./creditDraftActions.ts";

export type CreditDraftState = { readonly credits: readonly Credit[]; readonly dirty: boolean };

export const initialCreditDraftState: CreditDraftState = { credits: [], dirty: false };

function moved(credits: readonly Credit[], index: number, offset: -1 | 1): readonly Credit[] {
  const target = index + offset;
  const [credit, other] = [credits[index], credits[target]];
  if (credit === undefined || other === undefined) return credits;
  return credits.map((entry, position) => (position === index ? other : position === target ? credit : entry));
}

function edited(state: CreditDraftState, credits: readonly Credit[]): CreditDraftState {
  return credits === state.credits ? state : { credits, dirty: true };
}

export function creditDraftReducer(state: CreditDraftState, action: CreditDraftAction): CreditDraftState {
  switch (action.type) {
    case "credit-draft/reset":
      return { credits: action.credits, dirty: false };
    case "credit-draft/added":
      return edited(state, [...state.credits, action.credit]);
    case "credit-draft/removed":
      return edited(state, state.credits.filter((_, position) => position !== action.index));
    case "credit-draft/moved":
      return edited(state, moved(state.credits, action.index, action.offset));
    case "credit-draft/changed":
      return edited(state, state.credits.map((credit, position) => (position === action.index ? { ...credit, ...action.change } : credit)));
    case "credit-draft/names-loaded":
      return { ...state, credits: state.credits.map((credit) => (credit.performer.id === action.performerId ? { ...credit, performerNames: [...action.names] } : credit)) };
  }
}

export function replaceCreditsRequestOf(state: CreditDraftState): ReplaceCreditsRequest {
  return {
    credits: state.credits.map((credit) => ({
      performerId: credit.performer.id,
      creditedNameId: credit.creditedName?.id ?? null,
      role: credit.role,
      joinPhrase: credit.joinPhrase,
      instruments: [...credit.instruments],
    })),
  };
}
