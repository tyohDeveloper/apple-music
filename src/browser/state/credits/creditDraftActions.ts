// Actions on the credit list being edited for a recording (and, later, an album). The list
// is saved whole (ADR-0009), so edits stay local until the user saves or discards them.
import type { Credit } from "../../../contracts/credits/creditSchema.ts";

type NameChoice = { readonly id: string; readonly name: string };
export type CreditChange = Partial<Pick<Credit, "role" | "creditedName" | "joinPhrase" | "instruments">>;

export type CreditDraftAction =
  | { readonly type: "credit-draft/reset"; readonly credits: readonly Credit[] }
  | { readonly type: "credit-draft/added"; readonly credit: Credit }
  | { readonly type: "credit-draft/removed"; readonly index: number }
  | { readonly type: "credit-draft/moved"; readonly index: number; readonly offset: -1 | 1 }
  | { readonly type: "credit-draft/changed"; readonly index: number; readonly change: CreditChange }
  | { readonly type: "credit-draft/names-loaded"; readonly performerId: string; readonly names: readonly NameChoice[] };

export const creditsReset = (credits: readonly Credit[]): CreditDraftAction => ({ type: "credit-draft/reset", credits });
export const creditAdded = (credit: Credit): CreditDraftAction => ({ type: "credit-draft/added", credit });
export const creditRemoved = (index: number): CreditDraftAction => ({ type: "credit-draft/removed", index });
export const creditMoved = (index: number, offset: -1 | 1): CreditDraftAction => ({ type: "credit-draft/moved", index, offset });
export const creditChanged = (index: number, change: CreditChange): CreditDraftAction => ({ type: "credit-draft/changed", index, change });
export const creditNamesLoaded = (performerId: string, names: readonly NameChoice[]): CreditDraftAction => ({ type: "credit-draft/names-loaded", performerId, names });
