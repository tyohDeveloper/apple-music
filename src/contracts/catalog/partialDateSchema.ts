// A partial date (invariant 7). The "partial-date" format is registered with the server's
// validator from src/partial-dates/isPartialDate.ts, so impossible days are rejected too.
import Type from "typebox";

export const partialDateSchema = Type.String({ format: "partial-date", maxLength: 10 });
