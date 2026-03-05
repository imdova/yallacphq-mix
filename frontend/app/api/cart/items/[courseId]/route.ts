import { NextResponse } from "next/server";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import { cartResponseSchema } from "@/lib/api/contracts/cart";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  const { courseId } = params;

  if (!isBackendConfigured()) {
    return NextResponse.json(
      { courseIds: [] },
      { headers: { "x-request-id": requestId } }
    );
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  try {
    const res = await fetch(
      `${getBackendUrl()}${BACKEND_API_PREFIX}/cart/items/${encodeURIComponent(courseId)}`,
      { method: "DELETE", headers: { cookie: cookieHeader, "x-request-id": requestId } }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message ?? "Failed to remove from cart" },
        { status: res.status, headers: { "x-request-id": requestId } }
      );
    }
    const out = cartResponseSchema.safeParse(data);
    return NextResponse.json(
      out.success ? out.data : { courseIds: [] },
      { headers: { "x-request-id": requestId } }
    );
  } catch (e) {
    return NextResponse.json(
      { courseIds: [] },
      { status: 200, headers: { "x-request-id": requestId } }
    );
  }
}
