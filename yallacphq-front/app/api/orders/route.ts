import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { createOrderBodySchema, listOrdersResponseSchema } from "@/lib/api/contracts/order";
import { requireSession } from "@/lib/auth/server";
import { getUserById } from "@/lib/db/users";
import * as db from "@/lib/db/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession();
    const user = await getUserById(session.uid);
    if (!user) return jsonError(401, "UNAUTHENTICATED");

    const items = (await db.fetchOrders()).filter(
      (o) => o.studentEmail.toLowerCase() === user.email.toLowerCase()
    );
    return jsonOk(listOrdersResponseSchema.parse({ items }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    return jsonError(500, "Unexpected error");
  }
}

export async function POST(req: Request) {
  try {
    // For now, require authentication to create an order.
    const session = await requireSession();
    const user = await getUserById(session.uid);
    if (!user) return jsonError(401, "UNAUTHENTICATED");

    const body = createOrderBodySchema.parse(await req.json());
    const order = await db.createOrder({
      ...body,
      studentEmail: user.email,
      studentName: user.name,
    });
    return jsonOk({ order }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    return jsonError(500, "Unexpected error");
  }
}

