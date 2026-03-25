import { NextResponse } from "next/server";
import { BACKEND_API_PREFIX, getBackendUrl, isBackendConfigured } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";

function isLocalHost(host: string): boolean {
  return /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(host.trim());
}

function getAppOrigin(req: Request): string {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "";
  const url = new URL(req.url);
  const forwardedProto = req.headers.get("x-forwarded-proto")?.trim() || url.protocol.replace(":", "");
  const forwardedHost =
    req.headers.get("x-forwarded-host")?.trim() ||
    req.headers.get("host")?.trim() ||
    url.host;

  if (explicit) {
    try {
      const explicitUrl = new URL(explicit);
      if (!isLocalHost(explicitUrl.host)) return explicitUrl.origin;
    } catch {
      // Ignore invalid explicit origin and continue with request-derived origin.
    }
  }

  if (forwardedHost && !isLocalHost(forwardedHost)) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  if (explicit) {
    try {
      return new URL(explicit).origin;
    } catch {
      // Ignore invalid explicit origin and continue with request-derived origin.
    }
  }

  return url.origin;
}

function buildLoginRedirect(req: Request, message: string, next?: string | null) {
  const url = new URL("/auth/login", getAppOrigin(req));
  url.searchParams.set("oauth_error", message);
  if (next && next.startsWith("/")) {
    url.searchParams.set("next", next);
  }
  return NextResponse.redirect(url);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next");

  if (!isBackendConfigured()) {
    return buildLoginRedirect(req, "Google login requires backend configuration", next);
  }

  const target = new URL(`${getBackendUrl()}${BACKEND_API_PREFIX}/auth/google/start`);
  if (next && next.startsWith("/")) {
    target.searchParams.set("next", next);
  }

  return NextResponse.redirect(target);
}
