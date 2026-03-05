import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import {
  createPaymentSessionBodySchema,
  createPaymentSessionResponseSchema,
} from "@/lib/api/contracts/checkout";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import { requireSession } from "@/lib/auth/server";
import { getUserById } from "@/lib/db/users";
import { createOrder, fetchOrderById } from "@/lib/db/orders";

type SessionRecord = {
  sessionId: string;
  userId: string;
  provider: "paymob" | "stripe" | "manual";
  orderId: string;
  createdAt: number;
};

const sessionsByIdempotencyKey = new Map<string, SessionRecord>();

function providerForMethod(method: "paypal" | "card" | "bank"): SessionRecord["provider"] {
  if (method === "bank") return "manual";
  // demo mapping: treat PayPal/card as "stripe" provider
  return "stripe";
}

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
    const parsed = createPaymentSessionBodySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "Invalid request", { issues: zodIssues(parsed.error), requestId });
    }
    try {
      const res = await fetch(`${getBackendUrl()}${BACKEND_API_PREFIX}/checkout/session`, {
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
        return jsonError(
          res.status === 401 ? 401 : 400,
          (data?.message as string) ?? "Checkout failed",
          { requestId }
        );
      }
      const out = createPaymentSessionResponseSchema.safeParse(data);
      if (!out.success) return jsonError(500, "Invalid response", { requestId });
      return jsonOk(out.data, { status: res.status === 201 ? 201 : 200, requestId });
    } catch (e) {
      console.error("[checkout/session]", { requestId, error: e });
      return jsonError(500, "Checkout failed", { requestId });
    }
  }

  try {
    const session = await requireSession();
    const user = await getUserById(session.uid);
    if (!user) return jsonError(401, "UNAUTHENTICATED", { requestId });

    const body = createPaymentSessionBodySchema.parse(await req.json());
    const idempotencyKey = body.idempotencyKey?.trim();
    const key = idempotencyKey ? `${user.id}:${idempotencyKey}` : null;
    if (key) {
      const existing = sessionsByIdempotencyKey.get(key);
      if (existing) {
        const existingOrder = await fetchOrderById(existing.orderId);
        if (!existingOrder) {
          sessionsByIdempotencyKey.delete(key);
        } else {
        // We don't persist session lookup by id; return a minimal stable response.
        // Caller can proceed to payment using orderId.
        console.info("[checkout/session]", { requestId, reused: true, orderId: existingOrder.id, userId: user.id });
        return jsonOk(
          createPaymentSessionResponseSchema.parse({
            sessionId: existing.sessionId,
            provider: existing.provider,
            order: existingOrder,
          }),
          { requestId }
        );
        }
      }
    }

    const provider = providerForMethod(body.method);
    const order = await createOrder({
      studentName: user.name,
      studentEmail: user.email,
      studentPhone: user.phone,
      courseTitle: body.courseTitle,
      currency: body.currency ?? "USD",
      amount: body.amount,
      discountAmount: body.discountAmount,
      promoCode: body.promoCode,
      provider,
      paymentMethod: body.method === "bank" ? "cash" : "card",
      status: "pending",
      courseIds: body.courseIds?.length ? body.courseIds : undefined,
      bankTransferProofUrl: body.bankTransferProofUrl,
    });

    const sessionId = crypto.randomUUID();
    if (key) {
      sessionsByIdempotencyKey.set(key, {
        sessionId,
        userId: user.id,
        provider,
        orderId: order.id,
        createdAt: Date.now(),
      });
    }

    console.info("[checkout/session]", {
      requestId,
      created: true,
      orderId: order.id,
      userId: user.id,
      provider,
      method: body.method,
      amount: body.amount,
      promoCode: body.promoCode ?? null,
    });
    return jsonOk(createPaymentSessionResponseSchema.parse({ sessionId, provider, order }), { status: 201, requestId });
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED", { requestId });
    console.error("[checkout/session]", { requestId, error: err });
    return jsonError(500, "Unexpected error", { requestId });
  }
}

