// What the Apple Music routes need, built once at start from the configuration: developer
// tokens, the API client and the key that seals Music User Tokens. Null when the Apple
// Developer credentials or the token key are missing; Apple Music routes then answer
// apple-music-not-configured. A malformed private key or token key stops the server at start.
import { appleMusicClientOf, type AppleMusicClient } from "../../apple-music/appleMusicClient.ts";
import { CatalogRefusal } from "../../db/catalog/catalogRefusal.ts";
import { developerTokensOf, type DeveloperTokens } from "../../platform/appleDeveloperTokens.ts";
import { tokenKeyOf, type TokenKey } from "../../platform/tokenCipher.ts";
import type { ServerConfig } from "../config/readServerConfig.ts";

export type AppleMusicServices = {
  readonly tokens: DeveloperTokens;
  readonly client: AppleMusicClient;
  readonly tokenKey: TokenKey;
  readonly publicOrigin: string;
};

type AppleMusicSettings = Pick<ServerConfig, "apple" | "tokenEncryptionKey" | "appleMusicApiBaseUrl" | "publicOrigin">;

export async function appleMusicServicesOf(config: AppleMusicSettings): Promise<AppleMusicServices | null> {
  if (config.apple === null || config.tokenEncryptionKey === null) return null;
  const tokenKey = tokenKeyOf(config.tokenEncryptionKey);
  const tokens = await developerTokensOf(config.apple);
  const client = appleMusicClientOf({ baseUrl: config.appleMusicApiBaseUrl, developerToken: async () => (await tokens.forServer()).token });
  return { tokens, client, tokenKey, publicOrigin: config.publicOrigin };
}

export function requireAppleMusic(services: AppleMusicServices | null): AppleMusicServices {
  if (services === null) throw new CatalogRefusal("apple-music-not-configured");
  return services;
}
