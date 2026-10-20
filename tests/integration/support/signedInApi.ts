// Signs a new test user in through Better Auth and returns a JSON caller bound to that
// session, for route tests, and a GET that keeps the response headers.
import type { FastifyInstance, LightMyRequestResponse } from "fastify";
import type { DatabasePools } from "../../../src/db/createDatabasePools.ts";
import { createTestUser, testConfig } from "./testServices.ts";

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
export type ApiReply = { readonly status: number; readonly body: any };
export type SignedInApi = {
  readonly userId: string;
  readonly call: (method: Method, url: string, payload?: unknown) => Promise<ApiReply>;
  readonly get: (url: string) => Promise<LightMyRequestResponse>;
};

export async function signedInApi(server: FastifyInstance, pools: DatabasePools, label: string): Promise<SignedInApi> {
  const user = await createTestUser(pools, label);
  const origin = testConfig().publicOrigin;
  const signIn = await server.inject({ method: "POST", url: "/api/auth/sign-in/email", headers: { origin }, payload: { email: user.email, password: user.password } });
  if (signIn.statusCode !== 200) throw new Error(`sign-in failed with ${signIn.statusCode}`);
  const cookie = [signIn.headers["set-cookie"]].flat().map((value) => String(value).split(";")[0]).join("; ");
  const call = async (method: Method, url: string, payload?: unknown): Promise<ApiReply> => {
    const response = await server.inject({ method, url, headers: { cookie, origin }, ...(payload === undefined ? {} : { payload: payload as object }) });
    return { status: response.statusCode, body: response.body === "" ? null : response.json() };
  };
  const get = (url: string): Promise<LightMyRequestResponse> => server.inject({ method: "GET", url, headers: { cookie, origin } });
  return { userId: user.id, call, get };
}
