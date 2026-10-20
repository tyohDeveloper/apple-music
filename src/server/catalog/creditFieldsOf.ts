// The stored form of a replace-credits request, for recordings and albums alike.
import type { ReplaceCreditsRequest } from "../../contracts/credits/replaceCreditsRequestSchema.ts";
import type { CreditFields } from "../../db/catalog/recordings/recordingWrites.ts";

export function creditFieldsOf(body: ReplaceCreditsRequest): CreditFields[] {
  return body.credits.map(({ performerId, role, creditedNameId = null, joinPhrase = null, instruments = [] }) => ({ performerId, role, creditedNameId, joinPhrase, instruments }));
}
