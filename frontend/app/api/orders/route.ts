import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { createOrderBodySchema, listOrdersResponseSchema } from "@/lib/api/contracts/order";
import { requireSession } from "@/lib/auth/server";
import { getUserById } from "@/lib/db/users";
import * as db from "@/lib/db/orders";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (isBackendConfigured()) {
    try {
      const cookieHeader = req.headers.get("cookie") ?? "";
      const res = await fetch(`${getBackendUrl()}${BACKEND_API_PREFIX}/orders`, {
        method: "GET",
        headers: { cookie: cookieHeader },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return jsonError(
          res.status === 401 ? 401 : res.status === 403 ? 403 : 500,
          (data?.message as string) ?? "Failed to load orders"
        );
      }
      const parsed = listOrdersResponseSchema.safeParse(data);
      if (!parsed.success) return jsonError(500, "Invalid response");
      return jsonOk(parsed.data);
    } catch (e) {
      console.error("[orders GET]", e);
      return jsonError(500, "Failed to load orders");
    }
  }

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

