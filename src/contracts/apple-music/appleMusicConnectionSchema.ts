// A library's Apple Music connection as members see it: whether it is connected, the
// storefront Apple reported, and when it was connected. A connected library always has its
// connection time; one that is not connected has neither. The token itself is never sent.
import Type from "typebox";

export const appleMusicConnectionSchema = Type.Union([
  Type.Object(
    {
      status: Type.Literal("connected"),
      storefront: Type.Union([Type.String(), Type.Null()]),
      connectedAt: Type.String({ format: "date-time" }),
    },
    { additionalProperties: false },
  ),
  Type.Object(
    {
      status: Type.Literal("not-connected"),
      storefront: Type.Null(),
      connectedAt: Type.Null(),
    },
    { additionalProperties: false },
  ),
]);

export type AppleMusicConnection = Type.Static<typeof appleMusicConnectionSchema>;
