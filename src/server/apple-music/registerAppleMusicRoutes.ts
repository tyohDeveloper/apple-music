// Whether Apple Music is set up on this server, and developer tokens for MusicKit on the Web
// (docs/design/apple-music-import.md, slice G). Both need a session; the token is signed for
// this application's origin and is not cached by the browser or proxies.
import { appleMusicConfigurationSchema } from "../../contracts/apple-music/appleMusicConfigurationSchema.ts";
import { developerTokenSchema } from "../../contracts/apple-music/developerTokenSchema.ts";
import type { CatalogApp } from "../catalog/typedRoutes.ts";
import { requireAppleMusic, type AppleMusicServices } from "./appleMusicServices.ts";

export function registerAppleMusicRoutes(app: CatalogApp, services: AppleMusicServices | null): void {
  app.get("/api/apple-music/configuration", { schema: { response: { 200: appleMusicConfigurationSchema } } }, async () => ({ configured: services !== null }));
  app.get("/api/apple-music/developer-token", { schema: { response: { 200: developerTokenSchema } } }, async (_request, reply) => {
    const ready = requireAppleMusic(services);
    const { token, expiresAt } = await ready.tokens.forBrowser(ready.publicOrigin);
    void reply.header("cache-control", "no-store");
    return { token, expiresAt: expiresAt.toISOString() };
  });
}
