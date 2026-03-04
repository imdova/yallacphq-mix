import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { confirmPaymentBodySchema, confirmPaymentResponseSchema } from "@/lib/api/contracts/checkout";
import { requireSession } from "@/lib/auth/server";
import { getUserById } from "@/lib/db/users";
import { fetchOrderById, updateOrder } from "@/lib/db/orders";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
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

