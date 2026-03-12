import { NextResponse } from "next/server";
import { BACKEND_API_PREFIX, getBackendUrl, isBackendConfigured } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";

function buildLoginRedirect(req: Request, message: string, next?: string | null) {
  const url = new URL("/auth/login", req.url);
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
