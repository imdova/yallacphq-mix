import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import {
  adminDeleteWebinarResponseSchema,
  updateWebinarBodySchema,
  webinarNullableResponseSchema,
  webinarResponseSchema,
} from "@/lib/api/contracts/webinar";
import { BACKEND_API_PREFIX, getBackendUrl, isBackendConfigured } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

function proxyToBackend(
  method: "GET" | "PATCH" | "DELETE",
  id: string,
  req: Request,
  body?: unknown,
) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  const cookieHeader = req.headers.get("cookie") ?? "";
  const backendUrl = getBackendUrl();
  const headers: Record<string, string> = {
    cookie: cookieHeader,
    "x-request-id": requestId,
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  return fetch(`${backendUrl}${BACKEND_API_PREFIX}/admin/webinars/${encodeURIComponent(id)}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  if (!isBackendConfigured()) {
    return jsonError(500, "Backend is not configured", { requestId });
  }

  try {
    const res = await proxyToBackend("GET", ctx.params.id, req);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
      if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
      if (res.status === 404) return jsonError(404, "Not found", { requestId });
      const message = typeof data?.message === "string" ? data.message : "Backend error";
      return jsonError(res.status, message, { requestId });
    }
    return jsonOk(webinarNullableResponseSchema.parse(data), { requestId });
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
    }
    return jsonError(500, "Unexpected error", { requestId });
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  if (!isBackendConfigured()) {
    return jsonError(500, "Backend is not configured", { requestId });
  }

  try {
    const body = updateWebinarBodySchema.parse(await req.json());
    const res = await proxyToBackend("PATCH", ctx.params.id, req, body);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
      if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
      if (res.status === 404) return jsonError(404, "Not found", { requestId });
      if (res.status === 400) return jsonError(400, "Invalid request", { issues: data?.issues, requestId });
      const message = typeof data?.message === "string" ? data.message : "Backend error";
      return jsonError(res.status, message, { requestId });
    }
    return jsonOk(webinarResponseSchema.parse(data), { requestId });
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
    }
    return jsonError(500, "Unexpected error", { requestId });
  }
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  if (!isBackendConfigured()) {
    return jsonError(500, "Backend is not configured", { requestId });
  }

  try {
    const res = await proxyToBackend("DELETE", ctx.params.id, req);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
      if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
      if (res.status === 404) return jsonError(404, "Not found", { requestId });
      const message = typeof data?.message === "string" ? data.message : "Backend error";
      return jsonError(res.status, message, { requestId });
    }
    return jsonOk(adminDeleteWebinarResponseSchema.parse(data), { requestId });
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
    }
    return jsonError(500, "Unexpected error", { requestId });
  }
}
