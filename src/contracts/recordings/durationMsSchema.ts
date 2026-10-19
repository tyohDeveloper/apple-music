// A duration in milliseconds, as Apple Music reports it; the column is a 32-bit integer.
import Type from "typebox";

export const durationMsSchema = Type.Integer({ minimum: 0, maximum: 2147483647 });
