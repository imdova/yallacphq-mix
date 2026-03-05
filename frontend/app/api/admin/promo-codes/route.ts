import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import {
  createPromoCodeBodySchema,
  listPromoCodesResponseSchema,
} from "@/lib/api/contracts/promo";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import { requireAdmin } from "@/lib/auth/server";
import * as db from "@/lib/db/promo-codes";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/admin/promo-codes`, {
        method: "GET",
        headers: { cookie: cookieHeader, "x-request-id": requestId },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
        if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
        const msg = typeof data?.message === "string" ? data.message : "Backend error";
        return jsonError(res.status, msg, { requestId });
      }
      return jsonOk(listPromoCodesResponseSchema.parse(data), { requestId });
    } catch (err) {
      if (err instanceof ZodError)
        return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    const items = await db.fetchPromoCodes();
    return jsonOk(listPromoCodesResponseSchema.parse({ items }), { requestId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const body = createPromoCodeBodySchema.parse(await req.json());
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/admin/promo-codes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: cookieHeader,
          "x-request-id": requestId,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
        if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
        if (res.status === 400)
          return jsonError(400, "Invalid request", { issues: data?.issues, requestId });
        const message = typeof data?.message === "string" ? data.message : "Backend error";
        return jsonError(res.status, message, { requestId });
      }
      return jsonOk({ promo: data.promo }, { status: 201, requestId });
    } catch (err) {
      if (err instanceof ZodError)
        return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    const body = createPromoCodeBodySchema.parse(await req.json());
    const promo = await db.createPromoCode(body);
    return jsonOk({ promo }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError)
      return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}
