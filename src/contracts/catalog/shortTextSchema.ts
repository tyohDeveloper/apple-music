// A one-line text field: a name, title, area or disambiguation. Never blank.
import Type from "typebox";

export const shortTextSchema = Type.String({ minLength: 1, maxLength: 300, pattern: "\\S" });
