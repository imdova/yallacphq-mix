import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { updateOrderBodySchema } from "@/lib/api/contracts/order";
import { requireAdmin } from "@/lib/auth/server";
import * as db from "@/lib/db/orders";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    await requireAdmin();
    const order = await db.fetchOrderById(ctx.params.id);
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
  try {
    await requireAdmin();
    const body = updateOrderBodySchema.parse(await req.json());
    const now = new Date().toISOString();
    const normalized = {
      ...body,
      ...(body.status === "paid" && !body.paidAt ? { paidAt: now } : {}),
      ...(body.status === "refunded" && !body.refundedAt ? { refundedAt: now } : {}),
    };
    const updated = await db.updateOrder(ctx.params.id, normalized);
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

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  try {
    await requireAdmin();
    const ok = await db.removeOrder(ctx.params.id);
    if (!ok) return jsonError(404, "Not found");
    return jsonOk({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

