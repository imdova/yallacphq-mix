import { NextResponse } from "next/server";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import { authRefreshResponseSchema } from "@/lib/api/contracts/auth";

export const dynamic = "force-dynamic";

function forwardSetCookie(from: Response, to: NextResponse) {
  const setCookies = from.headers.getSetCookie?.();
  if (setCookies?.length) {
    for (const c of setCookies) to.headers.append("Set-Cookie", c);
  }
}

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/auth/refresh`, {
        method: "POST",
        headers: { cookie: cookieHeader, "x-request-id": requestId },
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          typeof data?.message === "string" ? data.message : "Session expired";
        return NextResponse.json(
          { message },
          { status: res.status, headers: { "x-request-id": requestId } }
        );
      }

      const parsed = authRefreshResponseSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json(
          { message: "Invalid refresh response" },
          { status: 502, headers: { "x-request-id": requestId } }
        );
      }

      const nextRes = NextResponse.json(parsed.data, {
        headers: { "x-request-id": requestId },
      });
      forwardSetCookie(res, nextRes);
      return nextRes;
    } catch {
      return NextResponse.json(
        { message: "Refresh failed" },
        { status: 503, headers: { "x-request-id": requestId } }
      );
    }
  }

  return NextResponse.json(
    { message: "Refresh not configured" },
    { status: 501, headers: { "x-request-id": requestId } }
  );
}
