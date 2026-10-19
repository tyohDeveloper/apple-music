// The browser's only path to this server's HTTP API (REMOTE). Results carry either the
// decoded body or an error code that views map to a localized message.
import type { ErrorResponse } from "../../contracts/errors/errorResponseSchema.ts";

export type ApiResult<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly code: string };

export type RequestOptions = { readonly method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"; readonly body?: unknown };

function isErrorResponse(body: unknown): body is ErrorResponse {
  if (typeof body !== "object" || body === null || !("error" in body)) return false;
  const error: unknown = body.error;
  return typeof error === "object" && error !== null && "code" in error && typeof error.code === "string";
}

function errorCodeOf(body: unknown, status: number): string {
  if (status === 401) return "unauthorized";
  if (isErrorResponse(body)) return body.error.code;
  return status === 400 ? "validation" : "unexpected";
}

async function readApiResult<T>(response: Response): Promise<ApiResult<T>> {
  const body: unknown = response.status === 204 ? null : await response.json().catch(() => null);
  if (response.ok) return { ok: true, value: body as T };
  return { ok: false, code: errorCodeOf(body, response.status) };
}

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const hasBody = options.body !== undefined;
  try {
    const response = await fetch(path, {
      method: options.method ?? "GET",
      credentials: "same-origin",
      headers: hasBody ? { "content-type": "application/json" } : {},
      ...(hasBody ? { body: JSON.stringify(options.body) } : {}),
    });
    return await readApiResult<T>(response);
  } catch {
    return { ok: false, code: "network" };
  }
}
