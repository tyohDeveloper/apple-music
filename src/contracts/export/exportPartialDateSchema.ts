// A partial date in a library export, or null: YYYY, YYYY-MM or YYYY-MM-DD (invariant 7).
// Written as a pattern rather than the server's partial-date format so that any JSON Schema
// validator can check a document; the server's format also checks each month's length.
import Type from "typebox";

export const exportPartialDateSchema = Type.Union([
  Type.String({ pattern: "^[0-9]{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?$" }),
  Type.Null(),
]);
