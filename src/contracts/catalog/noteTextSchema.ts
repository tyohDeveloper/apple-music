// Free-text notes, which may span lines.
import Type from "typebox";

export const noteTextSchema = Type.String({ maxLength: 10000 });
