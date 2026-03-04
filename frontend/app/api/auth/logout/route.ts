import { NextResponse } from "next/server";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

export async function POST(req: Request) {
  const requestId = newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      await fetch(`${backendUrl}${BACKEND_API_PREFIX}/auth/logout`, {
        method: "POST",
        headers: { cookie: cookieHeader, "x-request-id": requestId },
      });
    } catch {
      // best-effort; still clear cookies
    }
    const res = NextResponse.json(
      { ok: true },
      { headers: { "x-request-id": requestId } }
    );
    res.cookies.set(ACCESS_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
    res.cookies.set(REFRESH_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  }

  const { clearSessionCookie } = await import("@/lib/auth/cookies");
  const res = NextResponse.json(
    { ok: true },
    { headers: { "x-request-id": requestId } }
  );
  clearSessionCookie(res);
  return res;
}
