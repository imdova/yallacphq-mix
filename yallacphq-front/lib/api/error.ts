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
  return null;
}

