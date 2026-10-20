// Whether this server can reach Apple Music: its Apple Developer credentials and the key that
// seals Music User Tokens are both set (docs/design/apple-music-import.md, slice G).
import Type from "typebox";

export const appleMusicConfigurationSchema = Type.Object({ configured: Type.Boolean() }, { additionalProperties: false });

export type AppleMusicConfiguration = Type.Static<typeof appleMusicConfigurationSchema>;
