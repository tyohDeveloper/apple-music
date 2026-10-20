// The library's most recent sync run, or null before the first.
import Type from "typebox";
import { syncRunSchema } from "./syncRunSchema.ts";

export const latestSyncRunSchema = Type.Object({ run: Type.Union([syncRunSchema, Type.Null()]) }, { additionalProperties: false });

export type LatestSyncRun = Type.Static<typeof latestSyncRunSchema>;
