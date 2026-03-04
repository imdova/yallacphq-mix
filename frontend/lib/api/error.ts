import { ApiError } from "@/lib/utils/api";

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

export function getErrorMessage(err: unknown, fallback = "Unexpected error"): string {
  if (isApiError(err)) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as Record<string, unknown>).message;
    if (typeof msg === "string") return msg;
  }
  return fallback;
}

export function getErrorStatus(err: unknown): number | null {
  if (isApiError(err)) return err.status;
  if (err && typeof err === "object" && "status" in err) {
    const s = (err as Record<string, unknown>).status;
    if (typeof s === "number") return s;
  }
  return null;
}

/** True if the error is an auth failure (401 or message UNAUTHENTICATED). */
export function isUnauthenticatedError(err: unknown): boolean {
  if (isApiError(err)) return err.status === 401 || err.message === "UNAUTHENTICATED";
  return getErrorStatus(err) === 401;
}

