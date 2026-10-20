// The user's storefront (GET /v1/me/storefront), such as "us": the id of the first storefront
// in the answer. Asking for it is also how a newly given Music User Token is checked before
// it is stored.
import type { AppleMusicClient } from "./appleMusicClient.ts";
import { AppleMusicFailure } from "./appleMusicFailure.ts";

function firstIdIn(body: unknown): string | null {
  if (typeof body !== "object" || body === null || !("data" in body) || !Array.isArray(body.data)) return null;
  const first: unknown = body.data[0];
  if (typeof first !== "object" || first === null || !("id" in first)) return null;
  return typeof first.id === "string" && first.id !== "" ? first.id : null;
}

export async function storefrontOf(client: AppleMusicClient, musicUserToken: string): Promise<string> {
  const id = firstIdIn(await client.get({ path: "/v1/me/storefront", musicUserToken }));
  if (id === null) throw new AppleMusicFailure("apple-music-unexpected", 200);
  return id;
}
