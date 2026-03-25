import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { quizNullableResponseSchema } from "@/lib/api/contracts/quiz";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (!isBackendConfigured()) {
    return jsonError(500, "Backend configuration required", { requestId });
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  try {
    const res = await fetch(
      `${getBackendUrl()}${BACKEND_API_PREFIX}/quizzes/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: { cookie: cookieHeader, "x-request-id": requestId },
      }
    );
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
