import { NextResponse } from "next/server";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import { cartResponseSchema, addToCartBodySchema } from "@/lib/api/contracts/cart";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (!isBackendConfigured()) {
    return NextResponse.json(
      { message: "Backend not configured" },
      { status: 503, headers: { "x-request-id": requestId } }
    );
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON" },
      { status: 400, headers: { "x-request-id": requestId } }
    );
  }
  const parsed = addToCartBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "courseId is required" },
      { status: 400, headers: { "x-request-id": requestId } }
    );
  }

  try {
    const res = await fetch(`${getBackendUrl()}${BACKEND_API_PREFIX}/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
        "x-request-id": requestId,
      },
      body: JSON.stringify({ courseId: parsed.data.courseId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message ?? "Failed to add to cart" },
        { status: res.status, headers: { "x-request-id": requestId } }
      );
    }
    const out = cartResponseSchema.safeParse(data);
    return NextResponse.json(
      out.success ? out.data : { courseIds: [parsed.data.courseId] },
      { headers: { "x-request-id": requestId } }
    );
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to add to cart" },
      { status: 502, headers: { "x-request-id": requestId } }
    );
  }
}
