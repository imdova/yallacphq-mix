import { z } from "zod";
import { apiFetch, ApiError, type ApiFetchOptions } from "@/lib/utils/api";

function getServerOrigin(): string {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  return explicit || "http://localhost:3000";
}

function getBaseUrl(): string | undefined {
  if (typeof window !== "undefined") return undefined;
  return getServerOrigin();
}

export type ClientFetchOptions = ApiFetchOptions & {
  /**
   * Validate the JSON response with Zod and return typed output.
   * If omitted, response is returned as-is.
   */
  schema?: z.ZodTypeAny;
  /** When true, do not attempt token refresh on 401. Used for the refresh endpoint. */
  skipRefreshRetry?: boolean;
};

/**
 * Standard API client for calling this app's BFF endpoints under `/api/*`.
 *
 * Defaults:
 * - `credentials: "include"` to send cookies for session auth.
 * - `baseUrl` is auto-set on the server so relative URLs work.
 * - On 401, attempts to refresh the access token once and retries the request.
 */
export async function apiClientFetch<S extends z.ZodTypeAny>(
  path: string,
  options: Omit<ClientFetchOptions, "schema"> & { schema: S }
): Promise<z.infer<S>>;
export async function apiClientFetch<T = unknown>(
  path: string,
  options: ClientFetchOptions = {}
): Promise<T> {
  const isServer = typeof window === "undefined";
  const baseUrl = options.baseUrl ?? getBaseUrl();
  const skipRefreshRetry = options.skipRefreshRetry === true;

  const doFetch = (): Promise<unknown> =>
    apiFetch<unknown>(path, {
      ...options,
      baseUrl,
      credentials: options.credentials ?? "include",
      cache: options.cache ?? (isServer ? "no-store" : undefined),
    });

  try {
    const data = await doFetch();

    if (options.schema) {
      try {
        return options.schema.parse(data) as T;
      } catch (err) {
        throw new ApiError("Invalid API response shape", 500, {
          cause: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return data as T;
  } catch (err) {
    if (
      !skipRefreshRetry &&
      !isServer &&
      err instanceof ApiError &&
      err.status === 401 &&
      path !== "/api/auth/refresh"
    ) {
      try {
        const { authRefresh } = await import("@/lib/dal/auth");
        await authRefresh();
      } catch {
        throw err;
      }
      const data = await doFetch();
      if (options.schema) {
        try {
          return options.schema.parse(data) as T;
        } catch (parseErr) {
          throw new ApiError("Invalid API response shape", 500, {
            cause: parseErr instanceof Error ? parseErr.message : String(parseErr),
          });
        }
      }
      return data as T;
    }
    throw err;
  }
}

export function apiGet<S extends z.ZodTypeAny>(
  path: string,
  options: Omit<ClientFetchOptions, "schema"> & { schema: S }
): Promise<z.infer<S>>;
export function apiGet<T = unknown>(path: string, options?: ClientFetchOptions): Promise<T>;
export function apiGet<T = unknown>(path: string, options?: ClientFetchOptions) {
  return (apiClientFetch as (p: string, o: ClientFetchOptions) => Promise<T>)(path, {
    ...(options ?? {}),
    method: "GET",
  });
}

export function apiPost<S extends z.ZodTypeAny>(
  path: string,
  body: unknown,
  options: Omit<ClientFetchOptions, "schema"> & { schema: S }
): Promise<z.infer<S>>;
export function apiPost<T = unknown>(path: string, body?: unknown, options?: ClientFetchOptions): Promise<T>;
export function apiPost<T = unknown>(path: string, body?: unknown, options?: ClientFetchOptions) {
  return (apiClientFetch as (p: string, o: ClientFetchOptions) => Promise<T>)(path, {
    ...(options ?? {}),
    method: "POST",
    body,
  });
}

export function apiPatch<S extends z.ZodTypeAny>(
  path: string,
  body: unknown,
  options: Omit<ClientFetchOptions, "schema"> & { schema: S }
): Promise<z.infer<S>>;
export function apiPatch<T = unknown>(path: string, body?: unknown, options?: ClientFetchOptions): Promise<T>;
export function apiPatch<T = unknown>(path: string, body?: unknown, options?: ClientFetchOptions) {
  return (apiClientFetch as (p: string, o: ClientFetchOptions) => Promise<T>)(path, {
    ...(options ?? {}),
    method: "PATCH",
    body,
  });
}

export function apiDelete<S extends z.ZodTypeAny>(
  path: string,
  options: Omit<ClientFetchOptions, "schema"> & { schema: S }
): Promise<z.infer<S>>;
export function apiDelete<T = unknown>(path: string, options?: ClientFetchOptions): Promise<T>;
export function apiDelete<T = unknown>(path: string, options?: ClientFetchOptions) {
  return (apiClientFetch as (p: string, o: ClientFetchOptions) => Promise<T>)(path, {
    ...(options ?? {}),
    method: "DELETE",
  });
}

