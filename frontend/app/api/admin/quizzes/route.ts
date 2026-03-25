import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import {
  createQuizBodySchema,
  listQuizzesResponseSchema,
  quizResponseSchema,
} from "@/lib/api/contracts/quiz";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (!isBackendConfigured()) {
    return jsonError(500, "Backend configuration required", { requestId });
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  const backendUrl = getBackendUrl();
  try {
    const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/admin/quizzes`, {
      method: "GET",
      headers: { cookie: cookieHeader, "x-request-id": requestId },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
      if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
      const message = typeof data?.message === "string" ? data.message : "Backend error";
      return jsonError(res.status, message, { requestId });
    }
    return jsonOk(listQuizzesResponseSchema.parse(data), { requestId });
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
    }
    return jsonError(500, "Unexpected error", { requestId });
  }
}

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (!isBackendConfigured()) {
    return jsonError(500, "Backend configuration required", { requestId });
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  const backendUrl = getBackendUrl();
  try {
    const body = createQuizBodySchema.parse(await req.json());
    const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/admin/quizzes`, {
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
      if (res.status === 400) return jsonError(400, "Invalid request", { issues: data?.issues, requestId });
      const message = typeof data?.message === "string" ? data.message : "Backend error";
      return jsonError(res.status, message, { requestId });
    }
    return jsonOk(quizResponseSchema.parse(data), { status: 201, requestId });
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
    }
    return jsonError(500, "Unexpected error", { requestId });
  }
}
