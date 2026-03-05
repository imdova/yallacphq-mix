import { NextResponse } from "next/server";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import { cartResponseSchema } from "@/lib/api/contracts/cart";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (!isBackendConfigured()) {
    return NextResponse.json(
      { courseIds: [] },
      { headers: { "x-request-id": requestId } }
    );
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  try {
    const res = await fetch(`${getBackendUrl()}${BACKEND_API_PREFIX}/cart`, {
      method: "GET",
      headers: { cookie: cookieHeader, "x-request-id": requestId },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json(
          { courseIds: [] },
          { status: 200, headers: { "x-request-id": requestId } }
        );
      }
      return NextResponse.json(
        { message: data?.message ?? "Failed to load cart" },
        { status: res.status, headers: { "x-request-id": requestId } }
      );
    }
    const parsed = cartResponseSchema.safeParse(data);
    return NextResponse.json(
      parsed.success ? parsed.data : { courseIds: [] },
      { headers: { "x-request-id": requestId } }
    );
  } catch {
    return NextResponse.json(
      { courseIds: [] },
      { status: 200, headers: { "x-request-id": requestId } }
    );
  }
}

export async function DELETE(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (!isBackendConfigured()) {
    return NextResponse.json(
      { courseIds: [] },
      { headers: { "x-request-id": requestId } }
    );
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  try {
    const res = await fetch(`${getBackendUrl()}${BACKEND_API_PREFIX}/cart`, {
      method: "DELETE",
      headers: { cookie: cookieHeader, "x-request-id": requestId },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message ?? "Failed to clear cart" },
        { status: res.status, headers: { "x-request-id": requestId } }
      );
    }
    return NextResponse.json(
      cartResponseSchema.safeParse(data).success ? (data as { courseIds: string[] }) : { courseIds: [] },
      { headers: { "x-request-id": requestId } }
    );
  } catch {
    return NextResponse.json(
      { courseIds: [] },
      { status: 200, headers: { "x-request-id": requestId } }
    );
  }
}
