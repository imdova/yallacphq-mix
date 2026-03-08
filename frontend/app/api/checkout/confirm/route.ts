import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { confirmPaymentBodySchema, confirmPaymentResponseSchema } from "@/lib/api/contracts/checkout";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { requireSession } from "@/lib/auth/server";
import { getUserById } from "@/lib/db/users";
import { fetchOrderById, updateOrder } from "@/lib/db/orders";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError(400, "Invalid JSON", { requestId });
    }
    const parsed = confirmPaymentBodySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "Invalid request", { issues: zodIssues(parsed.error), requestId });
    }
    try {
      const res = await fetch(`${getBackendUrl()}${BACKEND_API_PREFIX}/checkout/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: cookieHeader,
          "x-request-id": requestId,
        },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const status =
          res.status === 401
            ? 401
            : res.status === 404
              ? 404
              : res.status >= 500
                ? 500
                : 400;
        return jsonError(
          status,
          (data?.message as string) ?? "Payment confirmation failed",
          { requestId }
        );
      }
      const out = confirmPaymentResponseSchema.safeParse(data);
      if (!out.success) return jsonError(500, "Invalid response", { requestId });
      return jsonOk(out.data, { requestId });
    } catch (e) {
      console.error("[checkout/confirm]", { requestId, error: e });
      return jsonError(500, "Payment confirmation failed", { requestId });
    }
  }

  try {
    const session = await requireSession();
    const user = await getUserById(session.uid);
    if (!user) return jsonError(401, "UNAUTHENTICATED", { requestId });

    const body = confirmPaymentBodySchema.parse(await req.json());
    const order = await fetchOrderById(body.orderId);
    if (!order) return jsonError(404, "Not found", { requestId });
    if (order.studentEmail.toLowerCase() !== user.email.toLowerCase()) return jsonError(403, "FORBIDDEN", { requestId });

    const nextStatus = body.status ?? "paid";
    const now = new Date().toISOString();

    const updated = await updateOrder(order.id, {
      status: nextStatus,
      transactionId: body.transactionId ?? order.transactionId ?? `TX-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      paidAt: nextStatus === "paid" ? now : order.paidAt,
      refundedAt: nextStatus === "refunded" ? now : order.refundedAt,
      provider: order.provider,
      currency: order.currency,
    });
    if (!updated) return jsonError(404, "Not found", { requestId });

    console.info("[checkout/confirm]", {
      requestId,
      ok: true,
      orderId: updated.id,
      userId: user.id,
      status: updated.status,
      provider: updated.provider,
    });
    return jsonOk(confirmPaymentResponseSchema.parse({ ok: true, order: updated }), { requestId });
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED", { requestId });
    console.error("[checkout/confirm]", { requestId, error: err });
    return jsonError(500, "Unexpected error", { requestId });
  }
}

