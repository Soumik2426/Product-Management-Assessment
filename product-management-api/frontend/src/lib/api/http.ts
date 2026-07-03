import { apiConfig, TOKEN_KEY } from "@/lib/api/config";
import type { ApiEnvelope } from "@/lib/api/backend-types";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function writeToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

function resolveUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${apiConfig.baseUrl}${normalized}`;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);

  if (!headers.has("Content-Type") && rest.body) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = readToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(resolveUrl(path), { ...rest, headers });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as ApiEnvelope<T>)
    : null;

  if (!response.ok) {
    const message =
      payload?.message ??
      payload?.error?.message ??
      `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  if (payload && "data" in payload && payload.data !== undefined) {
    return payload.data;
  }

  return payload as T;
}
