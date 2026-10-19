// Session requests against Better Auth's routes under /api/auth.
import type { SessionUser } from "../../contracts/session/sessionUser.ts";
import { requestJson, type ApiResult } from "./requestJson.ts";

type UserBody = { readonly user?: SessionUser | null } | null;

function pickUser(user: SessionUser): SessionUser {
  return { id: user.id, name: user.name, email: user.email };
}

export async function fetchSession(): Promise<ApiResult<SessionUser | null>> {
  const result = await requestJson<UserBody>("/api/auth/get-session");
  if (!result.ok) return result;
  const user = result.value?.user;
  return { ok: true, value: user === undefined || user === null ? null : pickUser(user) };
}

export async function signInWithEmail(email: string, password: string): Promise<ApiResult<SessionUser>> {
  const result = await requestJson<{ readonly user: SessionUser }>("/api/auth/sign-in/email", {
    method: "POST",
    body: { email, password },
  });
  if (result.ok) return { ok: true, value: pickUser(result.value.user) };
  return result.code === "unauthorized" ? { ok: false, code: "sign-in-rejected" } : result;
}

export function signOutSession(): Promise<ApiResult<unknown>> {
  return requestJson("/api/auth/sign-out", { method: "POST", body: {} });
}
