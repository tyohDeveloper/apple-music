// Starting a sync run. replaceMirror waives the guard that stops a run whose listing shares
// nothing with the mirror; only the owner may set it.
import Type from "typebox";

export const startSyncRunRequestSchema = Type.Object({ replaceMirror: Type.Boolean() }, { additionalProperties: false });

export type StartSyncRunRequest = Type.Static<typeof startSyncRunRequestSchema>;
