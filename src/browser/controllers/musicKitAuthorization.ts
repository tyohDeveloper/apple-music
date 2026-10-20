// Obtains a Music User Token with MusicKit on the Web (ADR-0005): loads Apple's script from
// its CDN once, configures it with a developer token from this server, and asks the user to
// authorize in the window Apple opens. Apple's script is the only third-party code the page
// runs (LI-1); it is recorded as binding BND-0003.
const musicKitScript = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";

type MusicKitInstance = { readonly authorize: () => Promise<string | undefined> };
type MusicKitGlobal = {
  readonly configure: (options: { readonly developerToken: string; readonly app: { readonly name: string; readonly build: string } }) => Promise<MusicKitInstance>;
};
type MusicKitWindow = { readonly MusicKit?: MusicKitGlobal };

export class MusicKitFailure extends Error {
  readonly code: "apple-music-script-unavailable" | "apple-music-authorization-cancelled";

  constructor(code: MusicKitFailure["code"]) {
    super(code);
    this.name = "MusicKitFailure";
    this.code = code;
  }
}

const loadedKit = (): MusicKitGlobal | undefined => (window as MusicKitWindow).MusicKit;

function musicKit(): Promise<MusicKitGlobal> {
  const ready = loadedKit();
  if (ready !== undefined) return Promise.resolve(ready);
  return new Promise((resolve, reject) => {
    const fail = () => reject(new MusicKitFailure("apple-music-script-unavailable"));
    document.addEventListener("musickitloaded", () => { const kit = loadedKit(); if (kit === undefined) fail(); else resolve(kit); }, { once: true });
    const script = document.createElement("script");
    script.src = musicKitScript;
    script.async = true;
    script.addEventListener("error", fail, { once: true });
    document.head.append(script);
  });
}

export async function musicUserTokenFrom(developerToken: string): Promise<string> {
  const instance = await (await musicKit()).configure({ developerToken, app: { name: "Apple Music Library Manager", build: "web" } });
  const token = await instance.authorize().catch(() => undefined);
  if (token === undefined || token === "") throw new MusicKitFailure("apple-music-authorization-cancelled");
  return token;
}
