// Apple Music on this server (docs/design/apple-music-import.md, slice G): whether it is set
// up, developer tokens for MusicKit on the Web, and a library's connection.
import type { AppleMusicConfiguration } from "../../contracts/apple-music/appleMusicConfigurationSchema.ts";
import type { AppleMusicConnection } from "../../contracts/apple-music/appleMusicConnectionSchema.ts";
import type { ConnectAppleMusicRequest } from "../../contracts/apple-music/connectAppleMusicRequestSchema.ts";
import type { DeveloperTokenReply } from "../../contracts/apple-music/developerTokenSchema.ts";
import { requestJson, type ApiResult } from "./requestJson.ts";

const connectionPath = (libraryId: string) => `/api/libraries/${encodeURIComponent(libraryId)}/apple-music/connection`;

export function fetchAppleMusicConfiguration(): Promise<ApiResult<AppleMusicConfiguration>> {
  return requestJson<AppleMusicConfiguration>("/api/apple-music/configuration");
}

export function fetchDeveloperToken(): Promise<ApiResult<DeveloperTokenReply>> {
  return requestJson<DeveloperTokenReply>("/api/apple-music/developer-token");
}

export function fetchConnection(libraryId: string): Promise<ApiResult<AppleMusicConnection>> {
  return requestJson<AppleMusicConnection>(connectionPath(libraryId));
}

export function putConnection(libraryId: string, body: ConnectAppleMusicRequest): Promise<ApiResult<AppleMusicConnection>> {
  return requestJson<AppleMusicConnection>(connectionPath(libraryId), { method: "PUT", body });
}

export function deleteConnection(libraryId: string): Promise<ApiResult<null>> {
  return requestJson<null>(connectionPath(libraryId), { method: "DELETE" });
}
