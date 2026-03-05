import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import {
  adminDeletePromoCodeResponseSchema,
  promoCodeNullableResponseSchema,
  promoCodeResponseSchema,
  updatePromoCodeBodySchema,
} from "@/lib/api/contracts/promo";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import { requireAdmin } from "@/lib/auth/server";
import * as db from "@/lib/db/promo-codes";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: { id: string } }
) {
  const id = ctx.params.id;
  const requestId = getRequestIdFromRequest(_req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = _req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const res = await fetch(
        `${backendUrl}${BACKEND_API_PREFIX}/admin/promo-codes/${encodeURIComponent(id)}`,
        { method: "GET", headers: { cookie: cookieHeader, "x-request-id": requestId } }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
        if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
        if (res.status === 404) return jsonError(404, "Not found", { requestId });
        const msg = typeof data?.message === "string" ? data.message : "Backend error";
        return jsonError(res.status, msg, { requestId });
      }
      return jsonOk(promoCodeNullableResponseSchema.parse(data), { requestId });
    } catch (err) {
      if (err instanceof ZodError)
        return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    const promo = await db.getPromoCodeById(id);
    if (!promo) return jsonError(404, "Not found");
    return jsonOk({ promo }, { requestId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: { id: string } }
) {
  const id = ctx.params.id;
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const body = updatePromoCodeBodySchema.parse(await req.json());
      const res = await fetch(
        `${backendUrl}${BACKEND_API_PREFIX}/admin/promo-codes/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            cookie: cookieHeader,
            "x-request-id": requestId,
          },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
        if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
        if (res.status === 404) return jsonError(404, "Not found", { requestId });
        if (res.status === 400) {
          const message =
            typeof data?.message === "string" ? data.message : "Invalid request";
          return jsonError(400, message, { issues: data?.issues, requestId });
        }
        const message = typeof data?.message === "string" ? data.message : "Backend error";
        return jsonError(res.status, message, { requestId });
      }
      return jsonOk(promoCodeResponseSchema.parse(data), { requestId });
    } catch (err) {
      if (err instanceof ZodError)
        return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    const body = updatePromoCodeBodySchema.parse(await req.json());
    const updated = await db.updatePromoCode(id, body);
    if (!updated) return jsonError(404, "Not found");
    return jsonOk({ promo: updated }, { requestId });
  } catch (err) {
    if (err instanceof ZodError)
      return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: { id: string } }
) {
  const id = ctx.params.id;
  const requestId = getRequestIdFromRequest(_req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = _req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const res = await fetch(
        `${backendUrl}${BACKEND_API_PREFIX}/admin/promo-codes/${encodeURIComponent(id)}`,
        { method: "DELETE", headers: { cookie: cookieHeader, "x-request-id": requestId } }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
        if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
        if (res.status === 404) return jsonError(404, "Not found", { requestId });
        const msg = typeof data?.message === "string" ? data.message : "Backend error";
        return jsonError(res.status, msg, { requestId });
      }
      return jsonOk(adminDeletePromoCodeResponseSchema.parse(data), { requestId });
    } catch (err) {
      if (err instanceof ZodError)
        return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    const ok = await db.deletePromoCode(id);
    if (!ok) return jsonError(404, "Not found");
    return jsonOk({ ok: true }, { requestId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}
