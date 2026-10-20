// A moment in a library export: UTC, RFC 3339, to the microsecond, such as
// 2026-10-20T01:22:33.123456Z.
import Type from "typebox";

export const exportInstantSchema = Type.String({ format: "date-time" });
