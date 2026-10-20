// A developer token for MusicKit on the Web, signed for this application's origin, and when
// it expires.
import Type from "typebox";

export const developerTokenSchema = Type.Object(
  { token: Type.String(), expiresAt: Type.String({ format: "date-time" }) },
  { additionalProperties: false },
);

export type DeveloperTokenReply = Type.Static<typeof developerTokenSchema>;
