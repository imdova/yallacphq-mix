import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import {
  updateOrderBodySchema,
  orderResponseSchema,
  orderNullableResponseSchema,
  adminDeleteOrderResponseSchema,
} from "@/lib/api/contracts/order";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import { requireAdmin } from "@/lib/auth/server";
import * as db from "@/lib/db/orders";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  const id = ctx.params.id;

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    try {
      const res = await fetch(
        `${getBackendUrl()}${BACKEND_API_PREFIX}/admin/orders/${encodeURIComponent(id)}`,
        {
          method: "GET",
          headers: { cookie: cookieHeader, "x-request-id": requestId },
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
        if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
        if (res.status === 404) return jsonError(404, "Not found", { requestId });
        return jsonError(res.status, (data?.message as string) ?? "Backend error", { requestId });
      }
      return jsonOk(orderNullableResponseSchema.parse(data), { requestId });
    } catch (err) {
      if (err instanceof ZodError) return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    const order = await db.fetchOrderById(id);
    if (!order) return jsonError(404, "Not found");
    return jsonOk({ order });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  const id = ctx.params.id;

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError(400, "Invalid JSON", { requestId });
    }
    const parsed = updateOrderBodySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "Invalid request", { issues: parsed.error.issues, requestId });
    }
    const normalized = {
      ...parsed.data,
      ...(parsed.data.status === "paid" && !parsed.data.paidAt ? { paidAt: new Date().toISOString() } : {}),
      ...(parsed.data.status === "refunded" && !parsed.data.refundedAt ? { refundedAt: new Date().toISOString() } : {}),
    };
    try {
      const res = await fetch(
        `${getBackendUrl()}${BACKEND_API_PREFIX}/admin/orders/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            cookie: cookieHeader,
            "x-request-id": requestId,
          },
          body: JSON.stringify(normalized),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
        if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
        if (res.status === 404) return jsonError(404, "Not found", { requestId });
        return jsonError(res.status, (data?.message as string) ?? "Backend error", { requestId });
      }
      return jsonOk(orderResponseSchema.parse(data), { requestId });
    } catch (err) {
      if (err instanceof ZodError) return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    const body = updateOrderBodySchema.parse(await req.json());
    const now = new Date().toISOString();
    const normalized = {
      ...body,
      ...(body.status === "paid" && !body.paidAt ? { paidAt: now } : {}),
      ...(body.status === "refunded" && !body.refundedAt ? { refundedAt: now } : {}),
    };
    const updated = await db.updateOrder(id, normalized);
    if (!updated) return jsonError(404, "Not found");
    return jsonOk({ order: updated });
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  const id = ctx.params.id;

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    try {
      const res = await fetch(
        `${getBackendUrl()}${BACKEND_API_PREFIX}/admin/orders/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { cookie: cookieHeader, "x-request-id": requestId },
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
        if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
        if (res.status === 404) return jsonError(404, "Not found", { requestId });
        return jsonError(res.status, (data?.message as string) ?? "Backend error", { requestId });
      }
      return jsonOk(adminDeleteOrderResponseSchema.parse(data), { requestId });
    } catch (err) {
      if (err instanceof ZodError) return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    const ok = await db.removeOrder(id);
    if (!ok) return jsonError(404, "Not found");
    return jsonOk({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}
