// The application's name and four-part version, from package.json in the working directory,
// which is where the server runs, as it does for drizzle/ and dist/client. Exports record
// them as the writer of each document.
import { readFileSync } from "node:fs";

export type ApplicationIdentity = { readonly name: string; readonly version: string };

export function readApplicationIdentity(manifest = "package.json"): ApplicationIdentity {
  const { name, version } = JSON.parse(readFileSync(manifest, "utf8")) as ApplicationIdentity;
  return { name, version };
}
