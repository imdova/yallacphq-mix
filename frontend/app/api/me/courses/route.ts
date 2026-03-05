import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api/route-helpers";
import { publicCoursesResponseSchema } from "@/lib/api/contracts/course";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (!isBackendConfigured()) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  const backendUrl = getBackendUrl();
  try {
    const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/courses/mine`, {
      method: "GET",
      headers: { cookie: cookieHeader, "x-request-id": requestId, Accept: "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
      return NextResponse.json(data ?? { message: "Failed to load courses" }, { status: res.status });
    }
    const parsed = publicCoursesResponseSchema.safeParse(data);
    if (parsed.success) return jsonOk(parsed.data, { requestId });
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("My courses proxy error:", err);
    return NextResponse.json(
      { message: "Failed to load your courses", requestId },
      { status: 502 }
    );
  }
}
