/**
 * Backend REST API base URL for server-side proxy (Next.js API routes).
 * Use BACKEND_URL so the backend URL is not exposed to the client.
 * Fallback to NEXT_PUBLIC_API_URL for compatibility.
 */
export function getBackendUrl(): string {
  const url =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  return url.replace(/\/$/, "");
}

/** Backend API path prefix (e.g. /api/v1). Use with getBackendUrl() for full URL. */
export const BACKEND_API_PREFIX = "/api/v1";

export function isBackendConfigured(): boolean {
  return getBackendUrl().length > 0;
}
