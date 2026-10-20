// PUT .../apple-music/connection: the Music User Token MusicKit on the Web gave the owner.
import Type from "typebox";

export const connectAppleMusicRequestSchema = Type.Object(
  { musicUserToken: Type.String({ minLength: 1, maxLength: 8192 }) },
  { additionalProperties: false },
);

export type ConnectAppleMusicRequest = Type.Static<typeof connectAppleMusicRequestSchema>;
