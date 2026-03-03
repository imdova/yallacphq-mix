import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { createOrderBodySchema, listOrdersResponseSchema } from "@/lib/api/contracts/order";
import { requireAdmin } from "@/lib/auth/server";
import * as db from "@/lib/db/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const items = await db.fetchOrders();
    return jsonOk(listOrdersResponseSchema.parse({ items }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = createOrderBodySchema.parse(await req.json());
    const order = await db.createOrder(body);
    return jsonOk({ order }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

