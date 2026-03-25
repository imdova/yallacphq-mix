import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import {
  adminDeleteQuizResponseSchema,
  quizNullableResponseSchema,
  quizResponseSchema,
  updateQuizBodySchema,
} from "@/lib/api/contracts/quiz";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

function proxyToBackend(
  method: "GET" | "PATCH" | "DELETE",
  id: string,
  req: Request,
  body?: unknown
): Promise<Response> {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  const cookieHeader = req.headers.get("cookie") ?? "";
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}${BACKEND_API_PREFIX}/admin/quizzes/${encodeURIComponent(id)}`;
  const headers: Record<string, string> = {
    cookie: cookieHeader,
    "x-request-id": requestId,
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  return fetch(url, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (!isBackendConfigured()) {
    return jsonError(500, "Backend configuration required", { requestId });
  }

  try {
    const res = await proxyToBackend("GET", id, req);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
      if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
      if (res.status === 404) return jsonError(404, "Not found", { requestId });
      const message = typeof data?.message === "string" ? data.message : "Backend error";
      return jsonError(res.status, message, { requestId });
    }
    return jsonOk(quizNullableResponseSchema.parse(data), { requestId });
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
    }
    return jsonError(500, "Unexpected error", { requestId });
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (!isBackendConfigured()) {
    return jsonError(500, "Backend configuration required", { requestId });
  }

  try {
    const body = updateQuizBodySchema.parse(await req.json());
    const res = await proxyToBackend("PATCH", id, req, body);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
      if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
      if (res.status === 404) return jsonError(404, "Not found", { requestId });
      if (res.status === 400) return jsonError(400, "Invalid request", { issues: data?.issues, requestId });
      const message = typeof data?.message === "string" ? data.message : "Backend error";
      return jsonError(res.status, message, { requestId });
    }
    return jsonOk(quizResponseSchema.parse(data), { requestId });
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
    }
    return jsonError(500, "Unexpected error", { requestId });
  }
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (!isBackendConfigured()) {
    return jsonError(500, "Backend configuration required", { requestId });
  }

  try {
    const res = await proxyToBackend("DELETE", id, req);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
      if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
      if (res.status === 404) return jsonError(404, "Not found", { requestId });
      const message = typeof data?.message === "string" ? data.message : "Backend error";
      return jsonError(res.status, message, { requestId });
    }
    return jsonOk(adminDeleteQuizResponseSchema.parse(data), { requestId });
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
    }
    return jsonError(500, "Unexpected error", { requestId });
  }
}
