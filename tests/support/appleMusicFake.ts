// A contract-faithful stand-in for the Apple Music API (docs/design/apple-music-import.md,
// "Fake Apple Music API"). It checks the developer token with the test key's public half
// (ES256, key id, team as issuer, at most six months of life) and the Music User Token against
// its fixture, answers in Apple's documented shapes, and can be told to fail chosen requests
// or hold the next one until the test releases it.
// It serves the storefront, and the library lists and catalog lookups of a fixture library
// that a test can swap (appleMusicFakeLibrary.ts).
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import { decodeProtectedHeader, exportPKCS8, generateKeyPair, jwtVerify } from "jose";
import { fixtureLibrary, type FakeLibrary } from "./appleMusicFixture.ts";
import { fakeErrorBody as errorBody, registerFakeLibraryRoutes } from "./appleMusicFakeLibrary.ts";

export const fakeTeamId = "FAKETEAM01";
export const fakeKeyId = "FAKEKEY001";
export const fakeMusicUserToken = "fake-music-user-token";
const sixMonthsSeconds = 15_777_000;

type Failure = { readonly status: number; readonly headers: Readonly<Record<string, string>> };
type Hold = { readonly reached: () => void; readonly released: Promise<void> };
export type HeldRequest = { readonly reached: Promise<void>; readonly release: () => void };

export type AppleMusicFake = {
  readonly baseUrl: string;
  readonly privateKeyPem: string;
  readonly requests: string[];
  readonly failNext: (status: number, times?: number, headers?: Record<string, string>) => void;
  readonly useLibrary: (library: FakeLibrary) => void;
  readonly holdNext: () => HeldRequest;
  readonly close: () => Promise<void>;
};

async function developerTokenRefused(request: FastifyRequest, publicKey: CryptoKey): Promise<boolean> {
  const token = request.headers.authorization?.replace(/^Bearer /u, "") ?? "";
  try {
    const { payload } = await jwtVerify(token, publicKey, { issuer: fakeTeamId, algorithms: ["ES256"] });
    return decodeProtectedHeader(token).kid !== fakeKeyId || (payload.exp ?? 0) - (payload.iat ?? 0) > sixMonthsSeconds;
  } catch {
    return true;
  }
}

function heldRequest(holds: Hold[]): HeldRequest {
  let reached = (): void => undefined;
  let release = (): void => undefined;
  const reachedPromise = new Promise<void>((resolve) => void (reached = resolve));
  const released = new Promise<void>((resolve) => void (release = resolve));
  holds.push({ reached, released });
  return { reached: reachedPromise, release };
}

function libraryTokenRefused(request: FastifyRequest): boolean {
  return request.url.startsWith("/v1/me/") && request.headers["music-user-token"] !== fakeMusicUserToken;
}

export async function startAppleMusicFake(): Promise<AppleMusicFake> {
  const { privateKey, publicKey } = await generateKeyPair("ES256", { extractable: true });
  const failures: Failure[] = [];
  const holds: Hold[] = [];
  const requests: string[] = [];
  const holder = { current: fixtureLibrary };
  const app = Fastify();
  app.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    requests.push(request.url);
    const hold = holds.shift();
    hold?.reached();
    await hold?.released;
    const failure = failures.shift();
    if (failure !== undefined) return reply.status(failure.status).headers(failure.headers).send(errorBody(failure.status));
    if (await developerTokenRefused(request, publicKey)) return reply.status(401).send(errorBody(401));
    if (libraryTokenRefused(request)) return reply.status(403).send(errorBody(403));
    return undefined;
  });
  app.get("/v1/me/storefront", async () => ({
    data: [{ id: "us", type: "storefronts", href: "/v1/storefronts/us", attributes: { name: "United States", defaultLanguageTag: "en-US", supportedLanguageTags: ["en-US", "es-MX"] } }],
  }));
  registerFakeLibraryRoutes(app, holder);
  const address = await app.listen({ port: 0, host: "127.0.0.1" });
  const failNext = (status: number, times = 1, headers: Record<string, string> = {}) => {
    for (let count = 0; count < times; count += 1) failures.push({ status, headers });
  };
  const useLibrary = (library: FakeLibrary) => void (holder.current = library);
  const holdNext = () => heldRequest(holds);
  return { baseUrl: address, privateKeyPem: await exportPKCS8(privateKey), requests, failNext, useLibrary, holdNext, close: () => app.close() };
}
