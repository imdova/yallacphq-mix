import { NextResponse } from "next/server";
import { jsonOk } from "@/lib/api/route-helpers";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/auth/me`, {
        method: "GET",
        headers: { cookie: cookieHeader, "x-request-id": requestId },
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return NextResponse.json(
          { message: data?.message ?? "Unauthorized" },
          { status: res.status, headers: { "x-request-id": requestId } }
        );
      }

      return NextResponse.json(data, {
        headers: { "x-request-id": requestId },
      });
    } catch {
      return jsonOk({ user: null }, { requestId });
    }
  }

  const { getSession } = await import("@/lib/auth/server");
  const { getUserById } = await import("@/lib/db/users");

  const session = await getSession();
  if (!session) return jsonOk({ user: null });
  const user = await getUserById(session.uid);
  return jsonOk({ user });
}
