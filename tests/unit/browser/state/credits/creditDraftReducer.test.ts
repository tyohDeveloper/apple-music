import { describe, expect, it } from "vitest";
import type { Credit } from "../../../../../src/contracts/credits/creditSchema.ts";
import { creditAdded, creditChanged, creditMoved, creditNamesLoaded, creditRemoved, creditsReset } from "../../../../../src/browser/state/credits/creditDraftActions.ts";
import { creditDraftReducer, initialCreditDraftState, replaceCreditsRequestOf } from "../../../../../src/browser/state/credits/creditDraftReducer.ts";

const creditOf = (id: string, name: string, role = "primary"): Credit => ({
  performer: { id, name },
  creditedName: null,
  role,
  joinPhrase: null,
  instruments: [],
  performerNames: [{ id: `${id}-name`, name }],
});
const simon = creditOf("simon", "Paul Simon");
const garfunkel = creditOf("garfunkel", "Art Garfunkel");
const stored = creditDraftReducer(initialCreditDraftState, creditsReset([simon, garfunkel]));

describe("creditDraftReducer", () => {
  it("credit-draft/reset takes the stored list as clean", () => {
    expect(stored).toEqual({ credits: [simon, garfunkel], dirty: false });
  });
  it("credit-draft/added appends a credit", () => {
    const added = creditDraftReducer(stored, creditAdded(creditOf("davis", "Miles Davis")));
    expect(added.credits.map((credit) => credit.performer.name)).toEqual(["Paul Simon", "Art Garfunkel", "Miles Davis"]);
    expect(added.dirty).toBe(true);
  });
  it("credit-draft/removed drops one credit", () => {
    expect(creditDraftReducer(stored, creditRemoved(0))).toEqual({ credits: [garfunkel], dirty: true });
  });
  it("credit-draft/moved swaps neighbours and ignores moves past either end", () => {
    expect(creditDraftReducer(stored, creditMoved(1, -1)).credits).toEqual([garfunkel, simon]);
    expect(creditDraftReducer(stored, creditMoved(0, -1))).toBe(stored);
    expect(creditDraftReducer(stored, creditMoved(1, 1))).toBe(stored);
  });
  it("credit-draft/changed edits one credit's role, name, join phrase or instruments", () => {
    const changed = creditDraftReducer(stored, creditChanged(0, { joinPhrase: " & ", instruments: ["guitar"] }));
    expect(changed.credits[0]).toMatchObject({ joinPhrase: " & ", instruments: ["guitar"] });
    expect(changed.dirty).toBe(true);
  });
  it("credit-draft/names-loaded gives every credit of the performer its names, without marking a change", () => {
    const names = [{ id: "artie", name: "Artie Garfunkel" }];
    const loaded = creditDraftReducer(stored, creditNamesLoaded("garfunkel", names));
    expect(loaded.credits[1]?.performerNames).toEqual(names);
    expect(loaded.credits[0]).toBe(simon);
    expect(loaded.dirty).toBe(false);
  });
});

describe("replaceCreditsRequestOf", () => {
  it("sends each credit by performer and credited name ids in order", () => {
    const named = creditDraftReducer(stored, creditChanged(1, { creditedName: { id: "artie", name: "Artie Garfunkel" }, joinPhrase: null }));
    expect(replaceCreditsRequestOf(named)).toEqual({
      credits: [
        { performerId: "simon", creditedNameId: null, role: "primary", joinPhrase: null, instruments: [] },
        { performerId: "garfunkel", creditedNameId: "artie", role: "primary", joinPhrase: null, instruments: [] },
      ],
    });
  });
});
