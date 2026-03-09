import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { adminEnrollUserBodySchema, adminEnrollUserResponseSchema } from "@/lib/api/contracts/course";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import { requireAdmin } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  ctx: { params: { id: string } }
) {
  const courseId = ctx.params.id;
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    try {
      const raw = await req.json();
      const parsed = adminEnrollUserBodySchema.safeParse(raw);
      if (!parsed.success) {
        return jsonError(400, "Invalid request", { issues: zodIssues(parsed.error), requestId });
      }
      const body = parsed.data;
      const cookieHeader = req.headers.get("cookie") ?? "";
      const backendUrl = getBackendUrl();
      const res = await fetch(
        `${backendUrl}${BACKEND_API_PREFIX}/admin/courses/${encodeURIComponent(courseId)}/enroll-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            cookie: cookieHeader,
            "x-request-id": requestId,
          },
          body: JSON.stringify({ userId: body.userId }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
        if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
        if (res.status === 404) return jsonError(404, "Not found", { requestId });
        const msg = typeof data?.message === "string" ? data.message : "Enrollment failed";
        return jsonError(res.status, msg, { requestId });
      }
      return jsonOk(adminEnrollUserResponseSchema.parse(data), { requestId });
    } catch {
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    return jsonError(501, "Enroll user is only supported when backend is configured", { requestId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}
